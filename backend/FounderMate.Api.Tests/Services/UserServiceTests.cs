using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Auth;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using FounderMate.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;

namespace FounderMate.Api.Tests;

public class UserServiceTests : TestBase
{
    private readonly IUserService _userService;
    private readonly Mock<IEmailService> _mockEmailService;
    private readonly Mock<IJwtService> _mockJwtService;

    public UserServiceTests()
    {
        _mockEmailService = new Mock<IEmailService>();
        _mockJwtService = new Mock<IJwtService>();
        _mockJwtService.Setup(x => x.GenerateToken(It.IsAny<User>())).Returns("fake-jwt-token");
        _mockJwtService.Setup(x => x.GetExpiration()).Returns(DateTime.UtcNow.AddHours(24));

        _userService = new UserService(Context, Mock.Of<ILogger<UserService>>(), _mockEmailService.Object, _mockJwtService.Object);
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserAndReturnToken()
    {
        // Arrange
        var request = new RegisterRequestDto
        {
            Email = "newuser@example.com",
            Password = "Password123!",
            Name = "New User"
        };

        // Act
        var result = await _userService.RegisterAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("fake-jwt-token");
        result.User.Email.Should().Be(request.Email);
        result.User.Name.Should().Be(request.Name);
        
        var userInDb = await Context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
        userInDb.Should().NotBeNull();
        BCrypt.Net.BCrypt.Verify(request.Password, userInDb!.PasswordHash).Should().BeTrue();
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowInvalidOperationException()
    {
        // Arrange
        CreateTestUser("existing@example.com", "Existing User");
        var request = new RegisterRequestDto
        {
            Email = "existing@example.com",
            Password = "Password123!",
            Name = "New User"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _userService.RegisterAsync(request));
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnToken()
    {
        // Arrange
        var user = CreateTestUser("login@example.com", "Login User");
        var request = new LoginRequestDto
        {
            Email = "login@example.com",
            Password = "Password123!"
        };

        // Act
        var result = await _userService.LoginAsync(request);

        // Assert
        result.Should().NotBeNull();
        result.Token.Should().Be("fake-jwt-token");
        result.User.Id.Should().Be(user.Id);
    }

    [Fact]
    public async Task LoginAsync_WithInvalidPassword_ShouldThrowInvalidOperationException()
    {
        // Arrange
        CreateTestUser("login2@example.com", "Login User 2");
        var request = new LoginRequestDto
        {
            Email = "login2@example.com",
            Password = "WrongPassword123!"
        };

        // Act & Assert
        await Assert.ThrowsAsync<InvalidOperationException>(() => _userService.LoginAsync(request));
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingUser_ShouldReturnUser()
    {
        // Arrange
        var user = CreateTestUser("getbyid@example.com", "Get By Id User");

        // Act
        var result = await _userService.GetByIdAsync(user.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(user.Id);
        result.Email.Should().Be(user.Email);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentUser_ShouldReturnNull()
    {
        // Act
        var result = await _userService.GetByIdAsync(99999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_WithCorrectCurrentPassword_ShouldUpdatePassword()
    {
        // Arrange
        var user = CreateTestUser("changepwd@example.com", "Change Pwd User");
        var request = new ChangePasswordRequestDto
        {
            CurrentPassword = "Password123!",
            NewPassword = "NewPassword123!",
            ConfirmNewPassword = "NewPassword123!"
        };

        // Act
        var result = await _userService.ChangePasswordAsync(user.Id, request);

        // Assert
        result.Should().BeTrue();
        var updatedUser = await Context.Users.FindAsync(user.Id);
        BCrypt.Net.BCrypt.Verify("NewPassword123!", updatedUser!.PasswordHash).Should().BeTrue();
        updatedUser.PasswordChangedAt.Should().NotBeNull();
    }

    [Fact]
    public async Task ChangePasswordAsync_WithIncorrectCurrentPassword_ShouldReturnFalse()
    {
        // Arrange
        var user = CreateTestUser("changepwd2@example.com", "Change Pwd User 2");
        var request = new ChangePasswordRequestDto
        {
            CurrentPassword = "WrongPassword123!",
            NewPassword = "NewPassword123!",
            ConfirmNewPassword = "NewPassword123!"
        };

        // Act
        var result = await _userService.ChangePasswordAsync(user.Id, request);

        // Assert
        result.Should().BeFalse();
    }
}