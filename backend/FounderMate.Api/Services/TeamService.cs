using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Team;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class TeamService : ITeamService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TeamService> _logger;

    public TeamService(AppDbContext context, ILogger<TeamService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TeamResponseDto> CreateAsync(int userId, int projectId, TeamCreateRequestDto request)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project is null || project.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Not authorized to create team for this project.");
        }

        var team = new Team
        {
            Name = request.Name,
            Description = request.Description,
            ProjectId = projectId,
            OwnerId = userId,
        };

        _context.Teams.Add(team);
        await _context.SaveChangesAsync();

        var ownerMember = new TeamMember
        {
            TeamId = team.Id,
            UserId = userId,
            Role = "Owner",
            JoinedAt = DateTime.UtcNow
        };
        _context.TeamMembers.Add(ownerMember);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Team {TeamId} created for Project {ProjectId} by User {UserId}", team.Id, projectId, userId);

        return team.ToDto(1);
    }

    public async Task<TeamResponseDto?> GetByIdAsync(int id)
    {
        var team = await _context.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == id);

        return team is null ? null : team.ToDto(team.Members.Count);
    }

    public async Task<PaginatedResponse<TeamResponseDto>> GetByProjectAsync(int projectId, int page = 1, int pageSize = 10)
    {
        var query = _context.Teams
            .Where(t => t.ProjectId == projectId)
            .Include(t => t.Members);

        var totalCount = await query.CountAsync();
        var teams = await query
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<TeamResponseDto>
        {
            Items = teams.Select(t => t.ToDto(t.Members.Count)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<TeamResponseDto?> UpdateAsync(int userId, int id, TeamUpdateRequestDto request)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team is null || team.OwnerId != userId)
        {
            return null;
        }

        if (request.Name != null) team.Name = request.Name;
        if (request.Description != null) team.Description = request.Description;
        team.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return team.ToDto();
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var team = await _context.Teams.FindAsync(id);
        if (team is null || team.OwnerId != userId)
        {
            return false;
        }

        _context.Teams.Remove(team);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PaginatedResponse<TeamMemberResponseDto>> GetMembersAsync(int teamId, int page = 1, int pageSize = 10)
    {
        var query = _context.TeamMembers
            .Where(m => m.TeamId == teamId)
            .Include(m => m.User);

        var totalCount = await query.CountAsync();
        var members = await query
            .OrderBy(m => m.Role)
            .ThenBy(m => m.JoinedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<TeamMemberResponseDto>
        {
            Items = members.Select(m => m.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<TeamMemberResponseDto?> AddMemberAsync(int userId, int teamId, AddTeamMemberRequestDto request)
    {
        var team = await _context.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId);

        if (team is null || team.OwnerId != userId)
        {
            return null;
        }

        var targetUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        if (targetUser is null)
        {
            throw new KeyNotFoundException("User not found.");
        }

        if (team.Members.Any(m => m.UserId == targetUser.Id))
        {
            throw new InvalidOperationException("User is already a member of this team.");
        }

        if (request.Role == "Owner" && team.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Only the team owner can assign Owner role.");
        }

        var member = new TeamMember
        {
            TeamId = teamId,
            UserId = targetUser.Id,
            Role = request.Role,
            JoinedAt = DateTime.UtcNow
        };

        _context.TeamMembers.Add(member);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {TargetUserId} added to Team {TeamId} as {Role} by User {UserId}", targetUser.Id, teamId, request.Role, userId);

        return member.ToDto();
    }

    public async Task<TeamMemberResponseDto?> UpdateMemberRoleAsync(int userId, int teamId, int memberId, UpdateTeamMemberRoleRequestDto request)
    {
        var team = await _context.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId);

        if (team is null || team.OwnerId != userId)
        {
            return null;
        }

        var member = team.Members.FirstOrDefault(m => m.Id == memberId);
        if (member is null)
        {
            return null;
        }

        if (request.Role == "Owner" && team.OwnerId != member.UserId)
        {
            throw new UnauthorizedAccessException("Cannot transfer ownership this way.");
        }

        member.Role = request.Role;
        await _context.SaveChangesAsync();

        return member.ToDto();
    }

    public async Task<bool> RemoveMemberAsync(int userId, int teamId, int memberId)
    {
        var team = await _context.Teams
            .Include(t => t.Members)
            .FirstOrDefaultAsync(t => t.Id == teamId);

        if (team is null || team.OwnerId != userId)
        {
            return false;
        }

        var member = team.Members.FirstOrDefault(m => m.Id == memberId);
        if (member is null)
        {
            return false;
        }

        if (member.Role == "Owner")
        {
            throw new InvalidOperationException("Cannot remove the team owner.");
        }

        _context.TeamMembers.Remove(member);
        await _context.SaveChangesAsync();
        return true;
    }
}