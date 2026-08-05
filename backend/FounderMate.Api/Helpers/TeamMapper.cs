using FounderMate.Api.DTOs.Team;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class TeamMapper
{
    public static TeamResponseDto ToDto(this Team team, int memberCount = 0)
    {
        return new TeamResponseDto
        {
            Id = team.Id,
            Name = team.Name,
            Description = team.Description,
            ProjectId = team.ProjectId,
            OwnerId = team.OwnerId,
            CreatedAt = team.CreatedAt,
            MemberCount = memberCount
        };
    }

    public static TeamMemberResponseDto ToDto(this TeamMember member)
    {
        return new TeamMemberResponseDto
        {
            Id = member.Id,
            TeamId = member.TeamId,
            UserId = member.UserId,
            UserName = member.User?.Name ?? string.Empty,
            UserEmail = member.User?.Email ?? string.Empty,
            Role = member.Role,
            JoinedAt = member.JoinedAt
        };
    }
}