namespace FounderMate.Api.DTOs.User;

public class UserResponseDto
{
    public int Id { get; init; }
    public string Email { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string? Headline { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? PasswordChangedAt { get; set; }
}
