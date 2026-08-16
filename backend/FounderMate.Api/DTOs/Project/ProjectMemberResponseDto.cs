namespace FounderMate.Api.DTOs.Project;

public class ProjectMemberResponseDto
{
    public int UserId { get; init; }
    public string UserName { get; init; } = string.Empty;
    public string? UserHeadline { get; init; }
    public DateTime JoinedAt { get; init; }
}