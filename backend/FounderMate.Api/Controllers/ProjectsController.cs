using System.Security.Claims;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService)
    {
        _projectService = projectService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status201Created)]
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
    public async Task<IActionResult> GetById(int id)
    {
        var project = await _projectService.GetByIdAsync(id);
        return project is not null ? Ok(project) : NotFound();
    }

    [HttpGet]
    [AllowAnonymous]
    [ProducesResponseType(typeof(PaginatedResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null,
        [FromQuery] string? category = null)
    {
        var projects = await _projectService.GetAllAsync(page, pageSize, search, category);
        return Ok(projects);
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(PaginatedResponse<ProjectResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetMyProjects(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? search = null)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var projects = await _projectService.GetMyProjectsAsync(userId, page, pageSize, search);
        return Ok(projects);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ProjectResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
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
    public async Task<IActionResult> Delete(int id)
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (!int.TryParse(userIdStr, out var userId)) return Unauthorized();

        var deleted = await _projectService.DeleteAsync(userId, id);
        return deleted ? NoContent() : Forbid();
    }
}
