using PatternLab.Api.Models;

namespace PatternLab.Api.Services;

public interface IContentService
{
    CatalogDto GetCatalog();
    PatternDetailDto? GetPattern(string id);
    IReadOnlyList<PatternDetailDto> GetAllPatterns();
}

public sealed class ContentService : IContentService
{
    private readonly CatalogDto _catalog;
    private readonly Dictionary<string, PatternDetailDto> _patterns;

    public ContentService()
    {
        var patterns = ContentSeed.BuildPatterns();
        _patterns = patterns.ToDictionary(p => p.Id, StringComparer.OrdinalIgnoreCase);
        _catalog = new CatalogDto(ContentSeed.BuildCategories(), patterns.Select(ToSummary).ToList());
    }

    public CatalogDto GetCatalog() => _catalog;

    public PatternDetailDto? GetPattern(string id) =>
        _patterns.TryGetValue(id, out var p) ? p : null;

    public IReadOnlyList<PatternDetailDto> GetAllPatterns() => _patterns.Values.ToList();

    private static PatternSummaryDto ToSummary(PatternDetailDto p) =>
        new(p.Id, p.CategoryId, p.Name, p.Intent, p.Tagline, p.HasAdvancedUnlock);
}
