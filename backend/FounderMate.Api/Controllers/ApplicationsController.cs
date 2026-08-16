using System.Security.Claims;
using FounderMate.Api.DTOs.Application;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/applications")]
[Authorize]
[SwaggerTag("Applications - Apply to projects and manage incoming applications")]
public class ApplicationsController : ControllerBase
{
    private readonly IApplicationService _applicationService;

    public ApplicationsController(IApplicationService applicationService)
    {
        _applicationService = applicationService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Apply to a project", Description = "Submits a new application (draft or pending) for a project. The applicant is the authenticated user.")]
    public async Task<IActionResult> Create([FromQuery] int projectId, [FromBody] ApplicationUpsertRequestDto request)
    {
        var applicantId = GetUserId();
        try
        {
            var application = await _applicationService.CreateAsync(applicantId, projectId, request);
            return CreatedAtAction(nameof(GetById), new { id = application.Id }, application);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Project not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Update application", Description = "Updates the authenticated user's own application (draft or pending). Reviewed applications cannot be edited.")]
    public async Task<IActionResult> Update(int id, [FromBody] ApplicationUpsertRequestDto request)
    {
        var applicantId = GetUserId();
        try
        {
            var application = await _applicationService.UpdateAsync(applicantId, id, request);
            if (application is null)
            {
                var existing = await _applicationService.GetByIdAsync(id);
                return existing is null ? NotFound() : Forbid();
            }
            return Ok(application);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Get application by ID", Description = "Returns a single application by its ID.")]
    public async Task<IActionResult> GetById(int id)
    {
        var application = await _applicationService.GetByIdAsync(id);
        if (application is null)
        {
            return NotFound();
        }
        return Ok(application);
    }

    [HttpGet("project/{projectId:int}")]
    [ProducesResponseType(typeof(PaginatedResponse<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "List applications for a project", Description = "Returns paginated list of applications for a project. Only the project owner can view them.")]
    public async Task<IActionResult> GetByProject(int projectId, [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1, [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10)
    {
        var userId = GetUserId();
        try
        {
            var applications = await _applicationService.GetByProjectAsync(userId, projectId, page, pageSize);
            return Ok(applications);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "Project not found." });
        }
    }

    [HttpGet("mine")]
    [ProducesResponseType(typeof(PaginatedResponse<ApplicationResponseDto>), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "List my applications", Description = "Returns paginated list of applications submitted by the authenticated user.")]
    public async Task<IActionResult> GetMine([FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1, [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10)
    {
        var applicantId = GetUserId();
        var applications = await _applicationService.GetMineAsync(applicantId, page, pageSize);
        return Ok(applications);
    }

    [HttpPost("{id:int}/accept")]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Accept application", Description = "Accepts a pending application. Only the project owner can accept.")]
    public async Task<IActionResult> Accept(int id)
    {
        return await UpdateStatus(id, "Accepted");
    }

    [HttpPost("{id:int}/reject")]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Reject application", Description = "Rejects a pending application. Only the project owner can reject.")]
    public async Task<IActionResult> Reject(int id)
    {
        return await UpdateStatus(id, "Rejected");
    }

    [HttpPost("{id:int}/withdraw")]
    [ProducesResponseType(typeof(ApplicationResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Withdraw application", Description = "Withdraws an application. Only the applicant can withdraw their own application.")]
    public async Task<IActionResult> Withdraw(int id)
    {
        var applicantId = GetUserId();
        try
        {
            var application = await _applicationService.WithdrawAsync(applicantId, id);
            if (application is null)
            {
                var existing = await _applicationService.GetByIdAsync(id);
                return existing is null ? NotFound() : Forbid();
            }
            return Ok(application);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete application", Description = "Deletes the authenticated user's own application.")]
    public async Task<IActionResult> Delete(int id)
    {
        var applicantId = GetUserId();
        var existing = await _applicationService.GetByIdAsync(id);
        if (existing is null)
        {
            return NotFound();
        }

        var removed = await _applicationService.DeleteAsync(applicantId, id);
        return removed ? NoContent() : Forbid();
    }

    private async Task<IActionResult> UpdateStatus(int id, string status)
    {
        var userId = GetUserId();
        try
        {
            var application = await _applicationService.UpdateStatusAsync(userId, id, status);
            if (application is null)
            {
                var existing = await _applicationService.GetByIdAsync(id);
                return existing is null ? NotFound() : Forbid();
            }
            return Ok(application);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
    }

    private int GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdStr, out var id) ? id : 0;
    }
}