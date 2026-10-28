using Microsoft.AspNetCore.Mvc;
using PatternLab.Api.Models;
using PatternLab.Api.Services;

namespace PatternLab.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class ProgressController(IProgressService progress, IContentService content) : ControllerBase
{
    [HttpGet("{userId}")]
    public ActionResult<ProgressSnapshotDto> Get(string userId) => progress.Get(userId);

    [HttpPost("{userId}/lessons/complete")]
    public ActionResult<ProgressSnapshotDto> CompleteLesson(string userId, [FromBody] CompleteLessonRequest request)
    {
        if (content.GetPattern(request.PatternId) is null)
        {
            return NotFound(new { error = "Pattern not found" });
        }

        return progress.CompleteLesson(userId, request);
    }

    [HttpPost("{userId}/exercises/submit")]
    public ActionResult<SubmitAnswerResponse> Submit(string userId, [FromBody] SubmitAnswerRequest request)
    {
        var pattern = content.GetPattern(request.PatternId);
        if (pattern is null)
        {
            return NotFound(new { error = "Pattern not found" });
        }

        try
        {
            return progress.SubmitAnswer(userId, request, pattern);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { error = ex.Message });
        }
    }

    [HttpPost("{userId}/arena/complete")]
    public ActionResult<CompleteArenaResponse> CompleteArena(string userId, [FromBody] CompleteArenaRequest request)
    {
        if (content.GetPattern(request.PatternId) is null)
        {
            return NotFound(new { error = "Pattern not found" });
        }

        try
        {
            return progress.CompleteArena(userId, request);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { error = ex.Message });
        }
    }
}
