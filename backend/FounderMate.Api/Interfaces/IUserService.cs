using FounderMate.Api.DTOs.Auth;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.User;

namespace FounderMate.Api.Interfaces;
public interface IUserService
{
    Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request);
    Task<AuthResponseDto> LoginAsync(LoginRequestDto request);
    Task<UserResponseDto?> GetByIdAsync(int id);
    Task<UserResponseDto?> UpdateProfileAsync(int userid, UpdateProfileRequestDto request);
    Task<bool> DeleteAsync(int id);
    Task<PaginatedResponse<UserResponseDto>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "createdAt", bool ascending = false);
    Task<UserResponseDto?> GetByEmailAsync(string email);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request);
    Task<bool> IsEmailAvailableAsync(string email);
}
