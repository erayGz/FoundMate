using System.Security.Claims;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[SwaggerTag("Projects - Create, read, update, delete projects")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Create a new project", Description = "Creates a new project owned by the authenticated user.")]
    public async Task<IActionResult> Create([FromBody] ProjectCreateRequestDto request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var project = await _projectService.CreateAsync(userId, request);
        return CreatedAtAction(nameof(GetById), new { id = project.Id }, project);
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Get project by ID", Description = "Returns a single project by its ID. Public access.")]
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        return project is not null ? Ok(project) : NotFound();
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaginatedResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "List projects", Description = "Returns paginated list of projects with optional search and category filter.")]
    public async Task<IActionResult> GetAll(
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10,
        [FromQuery][SwaggerParameter("Search in title/description")] string? search = null,
        [FromQuery][SwaggerParameter("Filter by category")] string? category = null)
    {
        var projects = await _projectService.GetAllAsync(page, pageSize, search, category);
        return Ok(projects);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(PaginatedResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Get my projects", Description = "Returns paginated list of projects owned by the authenticated user.")]
    public async Task<IActionResult> GetMyProjects(
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10,
        [FromQuery][SwaggerParameter("Search in title/description")] string? search = null)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var projects = await _projectService.GetMyProjectsAsync(userId, page, pageSize, search);
        return Ok(projects);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Update project", Description = "Updates a project. Only the owner can update.")]
    public async Task<IActionResult> Update(int id, [FromBody] ProjectUpdateRequestDto request)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var project = await _projectService.UpdateAsync(userId, id, request);
        return project is not null ? Ok(project) : Forbid();
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete project", Description = "Deletes a project. Only the owner can delete.")]
    public async Task<IActionResult> Delete(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var deleted = await _projectService.DeleteAsync(userId, id);
        return deleted ? NoContent() : Forbid();
    }
}
