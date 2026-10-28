using System.Text.Json;
using PatternLab.Api.Models;

namespace PatternLab.Api.Services;

public interface IProgressService
{
    ProgressSnapshotDto Get(string userId);
    ProgressSnapshotDto CompleteLesson(string userId, CompleteLessonRequest request);
    SubmitAnswerResponse SubmitAnswer(string userId, SubmitAnswerRequest request, PatternDetailDto pattern);
    CompleteArenaResponse CompleteArena(string userId, CompleteArenaRequest request);
}

public sealed class ProgressService : IProgressService
{
    private static readonly JsonSerializerOptions JsonOptions = new()
    {
        WriteIndented = true,
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    private readonly string _storePath;
    private readonly object _gate = new();

    public ProgressService(IWebHostEnvironment env)
    {
        var dataDir = Path.Combine(env.ContentRootPath, "Data");
        Directory.CreateDirectory(dataDir);
        _storePath = Path.Combine(dataDir, "progress-store.json");
    }

    public ProgressSnapshotDto Get(string userId)
    {
        lock (_gate)
        {
            var store = Load();
            var progress = store.GetOrCreate(userId);
            TouchStreak(progress);
            Save(store.With(progress));
            return ToSnapshot(progress);
        }
    }

    public ProgressSnapshotDto CompleteLesson(string userId, CompleteLessonRequest request)
    {
        lock (_gate)
        {
            var store = Load();
            var progress = store.GetOrCreate(userId);
            TouchStreak(progress);

            var key = $"{request.PatternId}:{request.Level}:lesson";
            if (!progress.CompletedLessons.Contains(key, StringComparer.OrdinalIgnoreCase))
            {
                progress.CompletedLessons.Add(key);
                progress.Xp += 25;
                progress.PatternScores[request.PatternId] =
                    progress.PatternScores.GetValueOrDefault(request.PatternId) + 25;
                MaybeAwardAchievements(progress);
                MaybeUnlock(progress);
            }

            Save(store.With(progress));
            return ToSnapshot(progress);
        }
    }

    public SubmitAnswerResponse SubmitAnswer(string userId, SubmitAnswerRequest request, PatternDetailDto pattern)
    {
        lock (_gate)
        {
            var exercise = pattern.Exercises.FirstOrDefault(e =>
                e.Id.Equals(request.ExerciseId, StringComparison.OrdinalIgnoreCase));

            if (exercise is null)
            {
                throw new KeyNotFoundException($"Exercise '{request.ExerciseId}' not found.");
            }

            if (exercise.RequiresUnlock)
            {
                var storeCheck = Load();
                var pCheck = storeCheck.GetOrCreate(userId);
                if (!pCheck.Unlocks.Contains("advanced-observer", StringComparer.OrdinalIgnoreCase) &&
                    !pCheck.Unlocks.Contains(exercise.Id, StringComparer.OrdinalIgnoreCase))
                {
                    throw new InvalidOperationException("Exercise is locked. Complete more lessons to unlock.");
                }
            }

            var store = Load();
            var progress = store.GetOrCreate(userId);
            TouchStreak(progress);

            var correct = request.SelectedIndex == exercise.CorrectIndex;
            var awardKey = $"{pattern.Id}:{exercise.Id}";
            var xp = 0;

            // Score understanding: XP only on first correct answer for an exercise.
            if (correct && !progress.CompletedExercises.Contains(awardKey, StringComparer.OrdinalIgnoreCase))
            {
                progress.CompletedExercises.Add(awardKey);
                xp = exercise.XpReward;
                progress.Xp += xp;
                progress.PatternScores[pattern.Id] =
                    progress.PatternScores.GetValueOrDefault(pattern.Id) + xp;
                MaybeAwardAchievements(progress);
                MaybeUnlock(progress);
            }

            Save(store.With(progress));

            return new SubmitAnswerResponse(
                correct,
                xp,
                "explanation",
                ToSnapshot(progress),
                exercise.Explanation
            );
        }
    }

    private static readonly Dictionary<string, int> ArenaXp = new(StringComparer.OrdinalIgnoreCase)
    {
        ["factory-method:blocks"] = 40,
        ["factory-method:code"] = 35,
        ["factory-method:refactor"] = 40,
        ["adapter:blocks"] = 40,
        ["adapter:code"] = 35,
        ["adapter:refactor"] = 40,
        ["observer:blocks"] = 45,
        ["observer:code"] = 35,
        ["observer:refactor"] = 40,
    };

    public CompleteArenaResponse CompleteArena(string userId, CompleteArenaRequest request)
    {
        lock (_gate)
        {
            var key = $"{request.PatternId}:{request.ChallengeId}";
            if (!ArenaXp.TryGetValue(key, out var reward))
            {
                throw new KeyNotFoundException($"Arena challenge '{key}' is not registered.");
            }

            var store = Load();
            var progress = store.GetOrCreate(userId);
            TouchStreak(progress);

            var awardKey = $"{request.PatternId}:arena:{request.ChallengeId}";
            var xp = 0;
            Dictionary<string, string> feedback;

            if (!request.Passed)
            {
                feedback = new Dictionary<string, string>
                {
                    ["en"] = "Structure not quite right yet — adjust the blocks and try again.",
                    ["fa"] = "ساختار هنوز دقیق نیست — قطعات را تنظیم کنید و دوباره تلاش کنید."
                };
                Save(store.With(progress));
                return new CompleteArenaResponse(false, 0, ToSnapshot(progress), feedback);
            }

            if (!progress.CompletedExercises.Contains(awardKey, StringComparer.OrdinalIgnoreCase))
            {
                progress.CompletedExercises.Add(awardKey);
                xp = reward;
                progress.Xp += xp;
                progress.PatternScores[request.PatternId] =
                    progress.PatternScores.GetValueOrDefault(request.PatternId) + xp;
                MaybeAwardAchievements(progress);
                MaybeUnlock(progress);
                feedback = new Dictionary<string, string>
                {
                    ["en"] = $"Arena cleared. Pattern structure holds. +{xp} XP.",
                    ["fa"] = $"زمین تمرین پاک شد. ساختار الگو درست است. +{xp} امتیاز."
                };
            }
            else
            {
                feedback = new Dictionary<string, string>
                {
                    ["en"] = "Already cleared — no extra XP, but the run still counts for practice.",
                    ["fa"] = "قبلاً پاک شده — امتیاز اضافه نیست، ولی تمرین حساب می‌شود."
                };
            }

            Save(store.With(progress));
            return new CompleteArenaResponse(true, xp, ToSnapshot(progress), feedback);
        }
    }

    private static void TouchStreak(UserProgress progress)
    {
        var today = DateOnly.FromDateTime(DateTime.UtcNow).ToString("yyyy-MM-dd");
        if (progress.LastActiveDate == today)
        {
            return;
        }

        if (progress.LastActiveDate is null)
        {
            progress.StreakDays = 1;
        }
        else if (DateOnly.TryParse(progress.LastActiveDate, out var last))
        {
            var delta = DateOnly.FromDateTime(DateTime.UtcNow).DayNumber - last.DayNumber;
            // Non-punitive: gaps pause the streak instead of resetting to zero harshly.
            progress.StreakDays = delta == 1 ? progress.StreakDays + 1 : Math.Max(1, progress.StreakDays);
        }
        else
        {
            progress.StreakDays = Math.Max(1, progress.StreakDays);
        }

        progress.LastActiveDate = today;
    }

    private static void MaybeAwardAchievements(UserProgress progress)
    {
        void Award(string id)
        {
            if (progress.Achievements.Any(a => a.Id == id)) return;
            progress.Achievements.Add(new AchievementDto(id, DateTime.UtcNow.ToString("O")));
        }

        if (progress.CompletedLessons.Count >= 1) Award("first-lesson");
        if (progress.CompletedExercises.Count >= 1) Award("first-quiz");
        if (progress.CompletedLessons.Select(k => k.Split(':')[0]).Distinct().Count() >= 3)
            Award("pattern-trio");
        if (progress.Xp >= 200) Award("xp-200");
        if (progress.StreakDays >= 3) Award("streak-3");
    }

    private static void MaybeUnlock(UserProgress progress)
    {
        var lessonsDone = progress.CompletedLessons.Count;
        var distinctPatterns = progress.CompletedLessons
            .Select(k => k.Split(':')[0])
            .Distinct(StringComparer.OrdinalIgnoreCase)
            .Count();

        if ((progress.Xp >= 150 || distinctPatterns >= 2 || lessonsDone >= 4) &&
            !progress.Unlocks.Contains("advanced-observer", StringComparer.OrdinalIgnoreCase))
        {
            progress.Unlocks.Add("advanced-observer");
        }
    }

    private ProgressStore Load()
    {
        if (!File.Exists(_storePath))
        {
            return new ProgressStore();
        }

        var json = File.ReadAllText(_storePath);
        return JsonSerializer.Deserialize<ProgressStore>(json, JsonOptions) ?? new ProgressStore();
    }

    private void Save(ProgressStore store)
    {
        File.WriteAllText(_storePath, JsonSerializer.Serialize(store, JsonOptions));
    }

    private static ProgressSnapshotDto ToSnapshot(UserProgress progress)
    {
        var xpIntoLevel = progress.Xp % 100;
        return new ProgressSnapshotDto(
            progress.UserId,
            progress.Xp,
            progress.Level,
            progress.StreakDays,
            progress.LastActiveDate,
            progress.CompletedLessons.OrderBy(x => x).ToList(),
            progress.CompletedExercises.OrderBy(x => x).ToList(),
            progress.PatternScores,
            progress.Achievements,
            progress.Unlocks.OrderBy(x => x).ToList(),
            100 - xpIntoLevel
        );
    }

    private sealed class ProgressStore
    {
        public Dictionary<string, UserProgress> Users { get; set; } = new(StringComparer.OrdinalIgnoreCase);

        public UserProgress GetOrCreate(string userId)
        {
            if (!Users.TryGetValue(userId, out var progress))
            {
                progress = new UserProgress { UserId = userId };
                Users[userId] = progress;
            }

            return progress;
        }

        public ProgressStore With(UserProgress progress)
        {
            Users[progress.UserId] = progress;
            return this;
        }
    }
}
