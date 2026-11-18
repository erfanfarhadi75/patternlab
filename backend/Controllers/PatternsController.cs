using Microsoft.AspNetCore.Mvc;
using PatternLab.Api.Services;

namespace PatternLab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class PatternsController(IContentService content) : ControllerBase
{
    [HttpGet]
    public IActionResult GetCatalog([FromQuery] string? category = null, [FromQuery] string? q = null)
    {
        var catalog = content.GetCatalog();
        var patterns = catalog.Patterns.AsEnumerable();

        if (!string.IsNullOrWhiteSpace(category) &&
            !category.Equals("all", StringComparison.OrdinalIgnoreCase))
        {
            patterns = patterns.Where(p => p.CategoryId.Equals(category, StringComparison.OrdinalIgnoreCase));
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            patterns = patterns.Where(p =>
                p.Id.Contains(q, StringComparison.OrdinalIgnoreCase) ||
                p.Name.Values.Any(v => v.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
                p.Intent.Values.Any(v => v.Contains(q, StringComparison.OrdinalIgnoreCase)) ||
                p.Tagline.Values.Any(v => v.Contains(q, StringComparison.OrdinalIgnoreCase)));
        }

        return Ok(new { catalog.Categories, patterns = patterns.ToList() });
    }

    [HttpGet("{id}")]
    public IActionResult GetPattern(string id)
    {
        var pattern = content.GetPattern(id);
        return pattern is null ? NotFound(new { error = "Pattern not found" }) : Ok(pattern);
    }
}
