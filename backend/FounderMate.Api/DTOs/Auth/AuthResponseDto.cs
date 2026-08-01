using FounderMate.Api.DTOs.User;

namespace FounderMate.Api.DTOs.Auth;

public class AuthResponseDto
{
    public string Token { get; init; } = string.Empty;
    public DateTime ExpiresAt { get; init; }
    public UserResponseDto User { get; init; } = null!;
}
