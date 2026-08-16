using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Auth;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.User;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FounderMate.Api.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserService> _logger;
    private readonly IEmailService _emailService;
    private readonly IJwtService _jwtService;

    public UserService(AppDbContext context, ILogger<UserService> logger, IEmailService emailService, IJwtService jwtService)
    {
        _context = context;
        _logger = logger;
        _emailService = emailService;
        _jwtService = jwtService;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        var existingUser = await _context.Users
            .AnyAsync(u => u.Email == request.Email);

        if (existingUser)
        {
            throw new ConflictException("Email already registered.");
        }

        var user = new User
        {
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Name = request.Name,
            CreatedAt = DateTime.UtcNow,
            PasswordChangedAt = DateTime.UtcNow,
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {Email} registered successfully.", request.Email);
        await _emailService.SendWelcomeEmailAsync(request.Email, request.Name);

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            ExpiresAt = _jwtService.GetExpiration(),
            User = user.ToDto(),
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user is null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            throw new InvalidOperationException("Invalid email or password.");
        }

        _logger.LogInformation("User {Email} logged in.", request.Email);

        return new AuthResponseDto
        {
            Token = _jwtService.GenerateToken(user),
            ExpiresAt = _jwtService.GetExpiration(),
            User = user.ToDto(),
        };
    }

    public async Task<UserResponseDto?> GetByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        return user is null ? null : user.ToDto();
    }

    public async Task<UserResponseDto?> UpdateProfileAsync(int userId, UpdateProfileRequestDto request)
    {
        var user = await _context.Users.FindAsync(userId);

        if (user is null)
        {
            return null;
        }

        if (request.Name is not null)
        {
            user.Name = request.Name;
        }

        if (request.Headline is not null)
        {
            user.Headline = request.Headline;
        }

        await _context.SaveChangesAsync();
        return user.ToDto();
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);

        if (user is null)
        {
            return false;
        }

        _context.Users.Remove(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PaginatedResponse<UserResponseDto>> GetAllAsync(int page = 1, int pageSize = 10, string sortBy = "createdAt", bool ascending = false)
    {
        var query = _context.Users.AsQueryable();

        query = sortBy.ToLower() switch
        {
            "name" => ascending ? query.OrderBy(u => u.Name) : query.OrderByDescending(u => u.Name),
            "email" => ascending ? query.OrderBy(u => u.Email) : query.OrderByDescending(u => u.Email),
            _ => ascending ? query.OrderBy(u => u.CreatedAt) : query.OrderByDescending(u => u.CreatedAt),
        };

        var totalCount = await query.CountAsync();

        var users = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<UserResponseDto>
        {
            Items = users.Select(u => u.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<UserResponseDto?> GetByEmailAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);

        return user is null ? null : user.ToDto();
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordRequestDto request)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user is null)
        {
            return false;
        }

        if (!BCrypt.Net.BCrypt.Verify(request.CurrentPassword, user.PasswordHash))
        {
            _logger.LogWarning("Password change failed: incorrect current password for user {UserId}", userId);
            return false;
        }

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.NewPassword);
        user.PasswordChangedAt = DateTime.UtcNow;
        _context.Update(user);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password changed for user {UserId}", userId);
        return true;
    }


    public async Task<bool> IsEmailAvailableAsync(string email)
    {
        return !await _context.Users.AnyAsync(u => u.Email == email);
    }

    public async Task<PromoteResult> PromoteToAdminAsync(string email)
    {
        var normalizedEmail = email.Trim().ToLower();
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);
        if (user is null)
        {
            return PromoteResult.NotFound;
        }

        if (user.Role == "Admin")
        {
            return PromoteResult.AlreadyAdmin;
        }

        user.Role = "Admin";
        await _context.SaveChangesAsync();
        return PromoteResult.Success;
    }

}
