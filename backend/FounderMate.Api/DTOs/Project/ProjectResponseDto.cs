namespace FounderMate.Api.DTOs.Project;

public class ProjectResponseDto
{
    public int Id { get; init; }
    public string Title { get; init; } = string.Empty;
    public string Description { get; init; } = string.Empty;
    public string? Category { get; init; }
    public int OwnerId { get; init; }
    public DateTime CreatedAt { get; init; }
}