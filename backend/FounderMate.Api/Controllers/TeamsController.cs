using System.Security.Claims;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Team;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/projects/{projectId:int}/teams")]
[Authorize]
public class TeamsController : ControllerBase
{
    private readonly ITeamService _teamService;

    public TeamsController(ITeamService teamService)
    {
        _teamService = teamService;
    }

    [HttpPost]
    [ProducesResponseType(typeof(TeamResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Create(int projectId, [FromBody] TeamCreateRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var team = await _teamService.CreateAsync(userId, projectId, request);
            return CreatedAtAction(nameof(GetById), new { projectId, id = team.Id }, team);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(TeamResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(int projectId, int id)
    {
        var team = await _teamService.GetByIdAsync(id);
        if (team is null || team.ProjectId != projectId)
        {
            return NotFound();
        }
        return Ok(team);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<TeamResponseDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByProject(int projectId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var teams = await _teamService.GetByProjectAsync(projectId, page, pageSize);
        return Ok(teams);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(typeof(TeamResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int projectId, int id, [FromBody] TeamUpdateRequestDto request)
    {
        var userId = GetUserId();
        var team = await _teamService.UpdateAsync(userId, id, request);
        if (team is null || team.ProjectId != projectId)
        {
            return Forbid();
        }
        return Ok(team);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<IActionResult> Delete(int projectId, int id)
    {
        var userId = GetUserId();
        var deleted = await _teamService.DeleteAsync(userId, id);
        return deleted ? NoContent() : Forbid();
    }

    // Team members
    [HttpGet("{teamId:int}/members")]
    [ProducesResponseType(typeof(PaginatedResponse<TeamMemberResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMembers(int projectId, int teamId, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
    {
        var team = await _teamService.GetByIdAsync(teamId);
        if (team is null || team.ProjectId != projectId)
        {
            return NotFound();
        }

        var members = await _teamService.GetMembersAsync(teamId, page, pageSize);
        return Ok(members);
    }

    [HttpPost("{teamId:int}/members")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> AddMember(int projectId, int teamId, [FromBody] AddTeamMemberRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var member = await _teamService.AddMemberAsync(userId, teamId, request);
            if (member is null)
            {
                return Forbid();
            }
            return CreatedAtAction(nameof(GetMembers), new { projectId, teamId }, member);
        }
        catch (KeyNotFoundException)
        {
            return NotFound(new { message = "User not found." });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpPut("{teamId:int}/members/{memberId:int}")]
    [ProducesResponseType(typeof(TeamMemberResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> UpdateMemberRole(int projectId, int teamId, int memberId, [FromBody] UpdateTeamMemberRoleRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var member = await _teamService.UpdateMemberRoleAsync(userId, teamId, memberId, request);
            if (member is null)
            {
                return Forbid();
            }
            return Ok(member);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
    }

    [HttpDelete("{teamId:int}/members/{memberId:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> RemoveMember(int projectId, int teamId, int memberId)
    {
        var userId = GetUserId();
        try
        {
            var removed = await _teamService.RemoveMemberAsync(userId, teamId, memberId);
            return removed ? NoContent() : Forbid();
        }
        catch (InvalidOperationException)
        {
            return Conflict(new { message = "Cannot remove the team owner." });
        }
    }

    private int GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdStr, out var id) ? id : 0;
    }
}