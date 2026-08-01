using FounderMate.Api.Models;

namespace FounderMate.Api.Interfaces;

public interface IJwtService
{
    string GenerateToken(User user);
    DateTime GetExpiration();
}
