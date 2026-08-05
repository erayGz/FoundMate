using System.Security.Claims;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Task;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId:int}/tasks")]
[Authorize]
[SwaggerTag("Tasks - Manage tasks within projects")]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;

    public TasksController(ITaskService taskService)
    {
        _taskService = taskService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Create a task", Description = "Creates a new task within a project. Optionally assigns to a team member.")]
    public async Task<IActionResult> Create(int projectId, [FromBody] TaskCreateRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var task = await _taskService.CreateAsync(userId, projectId, request);
            return CreatedAtAction(nameof(GetById), new { projectId, id = task.Id }, task);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Get task by ID", Description = "Returns a single task by its ID within the project.")]
    public async Task<IActionResult> GetById(int projectId, int id)
    {
        var task = await _taskService.GetByIdAsync(id);
        if (task is null || task.ProjectId != projectId)
        {
            return NotFound();
        }
        return Ok(task);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "List tasks in project", Description = "Returns paginated list of tasks with optional filters (status, assignee, team).")]
    public async Task<IActionResult> GetByProject(
        int projectId,
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10,
        [FromQuery][SwaggerParameter("Filter by status (Todo, InProgress, InReview, Done)")] string? status = null,
        [FromQuery][SwaggerParameter("Filter by assignee user ID")] int? assigneeId = null,
        [FromQuery][SwaggerParameter("Filter by team ID")] int? teamId = null)
    {
        var tasks = await _taskService.GetByProjectAsync(projectId, page, pageSize, status, assigneeId, teamId);
        return Ok(tasks);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(PaginatedResponse<TaskResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Get my tasks", Description = "Returns paginated list of tasks assigned to or reported by the authenticated user.")]
    public async Task<IActionResult> GetMyTasks(
        int projectId,
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10,
        [FromQuery][SwaggerParameter("Filter by status")] string? status = null)
    {
        var userId = GetUserId();
        var tasks = await _taskService.GetMyTasksAsync(userId, page, pageSize, status);
        return Ok(tasks);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TaskResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Update task", Description = "Updates a task. Only the reporter or assignee can update.")]
    public async Task<IActionResult> Update(int projectId, int id, [FromBody] TaskUpdateRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var task = await _taskService.UpdateAsync(userId, id, request);
            if (task is null || task.ProjectId != projectId)
            {
                return Forbid();
            }
            return Ok(task);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete task", Description = "Deletes a task. Only the reporter can delete.")]
    public async Task<IActionResult> Delete(int projectId, int id)
    {
        var userId = GetUserId();
        var deleted = await _taskService.DeleteAsync(userId, id);
        return deleted ? NoContent() : Forbid();
    }

    // Task comments
    [HttpGet("{taskId:int}/comments")]
    [ProducesResponseType(typeof(PaginatedResponse<TaskCommentResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "List task comments", Description = "Returns paginated list of comments on a task.")]
    public async Task<IActionResult> GetComments(int projectId, int taskId, [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1, [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10)
    {
        var task = await _taskService.GetByIdAsync(taskId);
        if (task is null || task.ProjectId != projectId)
        {
            return NotFound();
        }

        var comments = await _taskService.GetCommentsAsync(taskId, page, pageSize);
        return Ok(comments);
    }

    [HttpPost("{taskId:int}/comments")]
    [ProducesResponseType(typeof(TaskCommentResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Add comment to task", Description = "Adds a comment to a task. Notifies assignee and reporter.")]
    public async Task<IActionResult> AddComment(int projectId, int taskId, [FromBody] TaskCommentCreateRequestDto request)
    {
        var userId = GetUserId();
        var comment = await _taskService.AddCommentAsync(userId, taskId, request);
        if (comment is null)
        {
            return NotFound(new { message = "Task not found." });
        }
        return CreatedAtAction(nameof(GetComments), new { projectId, taskId }, comment);
    }

    [HttpPut("comments/{commentId:int}")]
    [ProducesResponseType(typeof(TaskCommentResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Update comment", Description = "Updates a comment. Only the author can update.")]
    public async Task<IActionResult> UpdateComment(int projectId, int commentId, [FromBody] TaskCommentUpdateRequestDto request)
    {
        var userId = GetUserId();
        var comment = await _taskService.UpdateCommentAsync(userId, commentId, request);
        return comment is not null ? Ok(comment) : Forbid();
    }

    [HttpDelete("comments/{commentId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete comment", Description = "Deletes a comment. Only the author can delete.")]
    public async Task<IActionResult> DeleteComment(int projectId, int commentId)
    {
        var userId = GetUserId();
        var deleted = await _taskService.DeleteCommentAsync(userId, commentId);
        return deleted ? NoContent() : Forbid();
    }

    private int GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdStr, out var id) ? id : 0;
    }
}