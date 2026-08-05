using System.Security.Claims;
using System.ComponentModel.DataAnnotations;
using FounderMate.Api.DTOs.Auth;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.User;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
[SwaggerTag("Users - Authentication and user management")]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpPost("register")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    [SwaggerOperation(Summary = "Register new user", Description = "Creates a new user account and returns JWT token.")]
    public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
    {
        _logger.LogInformation("Registration attempt for {Email}", request.Email);
        var result = await _userService.RegisterAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = result.User.Id }, result);
    }

    [HttpPost("login")]
    [AllowAnonymous]
    [ProducesResponseType(typeof(AuthResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "User login", Description = "Authenticates user and returns JWT token.")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        _logger.LogInformation("Login attempt for {Email}", request.Email);
        try
        {
            var result = await _userService.LoginAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException)
        {
            return Unauthorized(new { message = "Invalid email or password." });
        }
    }

    [HttpGet("{id:int}")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Get user by ID", Description = "Returns a single user by their ID.")]
    public async Task<IActionResult> GetById([FromRoute][SwaggerParameter("User ID")] int id)
    {
        _logger.LogInformation("Fetching user with ID {UserId}", id);
        var user = await _userService.GetByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }
        return Ok(user);
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<UserResponseDto>), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "List all users", Description = "Returns paginated list of all users with sorting options.")]
    public async Task<IActionResult> GetAll(
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 10,
        [FromQuery][SwaggerParameter("Sort by field (createdAt, name, email)")] string sortBy = "createdAt",
        [FromQuery][SwaggerParameter("Sort ascending")] bool ascending = false)
    {
        _logger.LogInformation("Fetching users - page {Page}, pageSize {PageSize}, sortBy {SortBy}, ascending {Ascending}", page, pageSize, sortBy, ascending);
        var users = await _userService.GetAllAsync(page, pageSize, sortBy, ascending);
        return Ok(users);
    }

    [HttpPatch("{id:int}")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Update profile", Description = "Updates the authenticated user's profile (name, headline).")]
    public async Task<IActionResult> UpdateProfile([FromRoute][SwaggerParameter("User ID")] int id, [FromBody] UpdateProfileRequestDto request)
    {
        _logger.LogInformation("Updating profile for user {UserId}", id);
        var user = await _userService.UpdateProfileAsync(id, request);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }
        return Ok(user);
    }

    [HttpDelete("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Delete user", Description = "Deletes a user account.")]
    public async Task<IActionResult> Delete([FromRoute][SwaggerParameter("User ID")] int id)
    {
        _logger.LogInformation("Deleting user with ID {UserId}", id);
        var deleted = await _userService.DeleteAsync(id);
        if (!deleted)
        {
            return NotFound(new { message = "User not found." });
        }
        return NoContent();
    }

    [HttpGet("by-email")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Get user by email", Description = "Returns a single user by their email address.")]
    public async Task<IActionResult> GetByEmail([FromQuery][SwaggerParameter("User email address")][EmailAddress] string email)
    {
        _logger.LogInformation("Fetching user by email {Email}", email);
        var user = await _userService.GetByEmailAsync(email);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }
        return Ok(user);
    }

    [HttpPost("{id:int}/change-password")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [SwaggerOperation(Summary = "Change password", Description = "Changes the user's password. Requires current password.")]
    public async Task<IActionResult> ChangePassword([FromRoute][SwaggerParameter("User ID")] int id, [FromBody] ChangePasswordRequestDto request)
    {
        _logger.LogInformation("Changing password for user {UserId}", id);
        var changed = await _userService.ChangePasswordAsync(id, request);
        if (!changed)
        {
            return BadRequest(new { message = "Current password is incorrect." });
        }
        return Ok(new { message = "Password changed successfully." });
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(UserResponseDto), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Get current user", Description = "Returns the authenticated user's profile from JWT claims.")]
    public async Task<IActionResult> GetCurrentUser()
    {
        var claimId = int.TryParse(User.FindFirstValue(ClaimTypes.NameIdentifier), out var id);
        if (!claimId)
        {
            return Unauthorized(new { message = "Missing user id claim." });
        }

        _logger.LogInformation("Fetching current user with ID {UserId}", id);
        var user = await _userService.GetByIdAsync(id);
        if (user is null)
        {
            return NotFound(new { message = "User not found." });
        }
        return Ok(user);
    }

    [HttpGet("check-email")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "Check email availability", Description = "Checks if an email is available for registration.")]
    public async Task<IActionResult> IsEmailAvailable([FromQuery][SwaggerParameter("Email to check")][EmailAddress] string email)
    {
        _logger.LogInformation("Checking email availability for {Email}", email);
        var available = await _userService.IsEmailAvailableAsync(email);
        return Ok(new { available });
    }

    [HttpGet("admin/users")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(typeof(List<UserResponseDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Admin: Get all users", Description = "Returns all users. Admin only.")]
    public async Task<IActionResult> AdminGetAll()
    {
        var users = await _userService.GetAllAsync(1, int.MaxValue);
        return Ok(users.Items);
    }

    [HttpPut("role/promote")]
    [Authorize(Roles = "Admin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [SwaggerOperation(Summary = "Promote user to Admin", Description = "Promotes a user to Admin role by email. Admin only.")]
    public async Task<IActionResult> PromoteToAdmin([FromQuery][SwaggerParameter("Email of user to promote")][EmailAddress] string email)
    {
        if (string.IsNullOrWhiteSpace(email) || !new EmailAddressAttribute().IsValid(email))
        {
            return BadRequest(new { message = "A valid email address is required." });
        }

        _logger.LogInformation("Promoting {Email} to Admin.", email);
        var result = await _userService.PromoteToAdminAsync(email);
        if (result == PromoteResult.NotFound)
        {
            return NotFound(new { message = "User not found." });
        }
        if (result == PromoteResult.AlreadyAdmin)
        {
            return BadRequest(new { message = "User is already an Admin." });
        }
        return Ok(new { message = "User promoted to Admin." });
    }
}
