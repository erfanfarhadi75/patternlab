namespace PatternLab.Api.Models;

public class UserProgress
{
    public string UserId { get; set; } = "local";
    public int Xp { get; set; }
    public int Level => Math.Max(1, (Xp / 100) + 1);
    public int StreakDays { get; set; }
    public string? LastActiveDate { get; set; }
    public List<string> CompletedLessons { get; set; } = [];
    public List<string> CompletedExercises { get; set; } = [];
    public Dictionary<string, int> PatternScores { get; set; } = new(StringComparer.OrdinalIgnoreCase);
    public List<AchievementDto> Achievements { get; set; } = [];
    public List<string> Unlocks { get; set; } = [];
}

public record AchievementDto(string Id, string UnlockedAt);

public record ProgressSnapshotDto(
    string UserId,
    int Xp,
    int Level,
    int StreakDays,
    string? LastActiveDate,
    IReadOnlyCollection<string> CompletedLessons,
    IReadOnlyCollection<string> CompletedExercises,
    IReadOnlyDictionary<string, int> PatternScores,
    IReadOnlyCollection<AchievementDto> Achievements,
    IReadOnlyCollection<string> Unlocks,
    int XpToNextLevel
);

public record CompleteLessonRequest(string PatternId, string Level);

public record SubmitAnswerRequest(string PatternId, string ExerciseId, int SelectedIndex, string Level);

public record SubmitAnswerResponse(
    bool Correct,
    int XpAwarded,
    string ExplanationLocaleKey,
    ProgressSnapshotDto Progress,
    Dictionary<string, string> Explanation
);
