using System.Security.Claims;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
[SwaggerTag("AI - AI-powered features for founders")]
public class AiController : ControllerBase
{
    private readonly IAiService _aiService;

    public AiController(IAiService aiService)
    {
        _aiService = aiService;
    }

    [HttpPost("project-ideas")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Generate project ideas", Description = "Generates startup project ideas based on interests and skills using AI.")]
    public async Task<IActionResult> GenerateProjectIdeas([FromBody] ProjectIdeasRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Interests) || string.IsNullOrWhiteSpace(request.Skills))
        {
            return BadRequest(new { message = "Interests and skills are required." });
        }

        var result = await _aiService.GenerateProjectIdeasAsync(request.Interests, request.Skills, request.Count);
        return Ok(new AiResponse { Result = result });
    }

    [HttpPost("task-breakdown")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Generate task breakdown", Description = "Breaks down a project into actionable tasks using AI.")]
    public async Task<IActionResult> GenerateTaskBreakdown([FromBody] TaskBreakdownRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProjectTitle) || string.IsNullOrWhiteSpace(request.ProjectDescription))
        {
            return BadRequest(new { message = "Project title and description are required." });
        }

        var result = await _aiService.GenerateTaskBreakdownAsync(request.ProjectTitle, request.ProjectDescription, request.TaskCount);
        return Ok(new AiResponse { Result = result });
    }

    [HttpPost("summarize-project")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Summarize project", Description = "Creates an executive summary of a project using AI.")]
    public async Task<IActionResult> SummarizeProject([FromBody] SummarizeProjectRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.ProjectTitle) || string.IsNullOrWhiteSpace(request.ProjectDescription))
        {
            return BadRequest(new { message = "Project title and description are required." });
        }

        var result = await _aiService.SummarizeProjectAsync(request.ProjectTitle, request.ProjectDescription, request.TaskTitles);
        return Ok(new AiResponse { Result = result });
    }

    [HttpPost("improve-task")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Improve task description", Description = "Enhances a task description with objectives, acceptance criteria, and technical notes using AI.")]
    public async Task<IActionResult> ImproveTaskDescription([FromBody] ImproveTaskRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.CurrentDescription))
        {
            return BadRequest(new { message = "Current description is required." });
        }

        var result = await _aiService.ImproveTaskDescriptionAsync(request.CurrentDescription, request.Context);
        return Ok(new AiResponse { Result = result });
    }

    [HttpPost("prioritize-tasks")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Prioritize tasks", Description = "Assigns priorities (Critical/High/Medium/Low) with justifications using AI.")]
    public async Task<IActionResult> SuggestTaskPriorities([FromBody] PrioritizeTasksRequest request)
    {
        if (request.TaskTitles.Count == 0 || request.TaskDescriptions.Count == 0 || request.TaskTitles.Count != request.TaskDescriptions.Count)
        {
            return BadRequest(new { message = "Task titles and descriptions are required and must match in count." });
        }

        var result = await _aiService.SuggestTaskPrioritiesAsync(request.TaskTitles, request.TaskDescriptions);
        return Ok(new AiResponse { Result = result });
    }

    [HttpPost("standup-summary")]
    [ProducesResponseType(typeof(AiResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Generate standup summary", Description = "Creates a daily standup summary from completed/in-progress tasks and blockers using AI.")]
    public async Task<IActionResult> GenerateStandupSummary([FromBody] StandupSummaryRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.UserName))
        {
            return BadRequest(new { message = "User name is required." });
        }

        var result = await _aiService.GenerateStandupSummaryAsync(request.UserName, request.CompletedTasks, request.InProgressTasks, request.Blockers);
        return Ok(new AiResponse { Result = result });
    }
}

public class AiResponse
{
    public string? Result { get; set; }
}

public class ProjectIdeasRequest
{
    public string Interests { get; set; } = string.Empty;
    public string Skills { get; set; } = string.Empty;
    public int Count { get; set; } = 5;
}

public class TaskBreakdownRequest
{
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public int TaskCount { get; set; } = 8;
}

public class SummarizeProjectRequest
{
    public string ProjectTitle { get; set; } = string.Empty;
    public string ProjectDescription { get; set; } = string.Empty;
    public List<string> TaskTitles { get; set; } = new();
}

public class ImproveTaskRequest
{
    public string CurrentDescription { get; set; } = string.Empty;
    public string Context { get; set; } = string.Empty;
}

public class PrioritizeTasksRequest
{
    public List<string> TaskTitles { get; set; } = new();
    public List<string> TaskDescriptions { get; set; } = new();
}

public class StandupSummaryRequest
{
    public string UserName { get; set; } = string.Empty;
    public List<string> CompletedTasks { get; set; } = new();
    public List<string> InProgressTasks { get; set; } = new();
    public List<string> Blockers { get; set; } = new();
}