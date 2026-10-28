namespace PatternLab.Api.Models;

public record CategoryDto(string Id, Dictionary<string, string> Name, Dictionary<string, string> Description);

public record PatternSummaryDto(
    string Id,
    string CategoryId,
    Dictionary<string, string> Name,
    Dictionary<string, string> Intent,
    Dictionary<string, string> Tagline,
    bool HasAdvancedUnlock
);

public record LearnSectionDto(string Id, Dictionary<string, string> Title, Dictionary<string, LevelTextDto> ByLevel);

public record LevelTextDto(
    Dictionary<string, string> Body,
    string? Code = null,
    Dictionary<string, string>? CodeWalkthrough = null
);

public record QuizQuestionDto(
    string Id,
    string Level,
    string Kind,
    Dictionary<string, string> Prompt,
    Dictionary<string, List<string>> Options,
    int CorrectIndex,
    Dictionary<string, string> Explanation,
    int XpReward,
    bool RequiresUnlock = false
);

public record PatternDetailDto(
    string Id,
    string CategoryId,
    Dictionary<string, string> Name,
    Dictionary<string, string> Intent,
    Dictionary<string, string> Tagline,
    List<LearnSectionDto> Sections,
    List<QuizQuestionDto> Exercises,
    List<string> SimilarPatternIds,
    bool HasAdvancedUnlock
);

public record CatalogDto(List<CategoryDto> Categories, List<PatternSummaryDto> Patterns);
