using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class ProjectMapper
{
    public static ProjectResponseDto ToDto(this Project project)
    {
        return new ProjectResponseDto
        {
            Id = project.Id,
            Title = project.Title,
            Description = project.Description,
            Category = project.Category,
            OwnerId = project.OwnerId,
            CreatedAt = project.CreatedAt
        };
    }

    public static ProjectMemberResponseDto ToMemberDto(this ProjectMember member)
    {
        return new ProjectMemberResponseDto
        {
            UserId = member.UserId,
            UserName = member.User?.Name ?? string.Empty,
            UserHeadline = member.User?.Headline,
            JoinedAt = member.JoinedAt
        };
    }
}
