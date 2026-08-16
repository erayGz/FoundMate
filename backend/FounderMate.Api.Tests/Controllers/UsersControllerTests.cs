using FounderMate.Api.Controllers;
using FounderMate.Api.DTOs.User;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;
using System.Security.Claims;

namespace FounderMate.Api.Tests;

public class UsersControllerTests
{
    private readonly Mock<IUserService> _mockUserService;
    private readonly UsersController _controller;
    private readonly int _testUserId = 1;

    public UsersControllerTests()
    {
        _mockUserService = new Mock<IUserService>();
        _controller = new UsersController(_mockUserService.Object, Mock.Of<ILogger<UsersController>>());

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, _testUserId.ToString())
        }, "test"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = user }
        };
    }

    [Fact]
    public async Task UpdateCurrentUser_WithClaims_ShouldUpdateOwnProfile()
    {
        // Arrange
        var request = new UpdateProfileRequestDto
        {
            Name = "Updated Me",
            Headline = "Kısa başlık"
        };
        var expected = new UserResponseDto
        {
            Id = _testUserId,
            Email = "me@example.com",
            Name = "Updated Me",
            Headline = "Kısa başlık",
            CreatedAt = DateTime.UtcNow
        };
        _mockUserService.Setup(x => x.UpdateProfileAsync(_testUserId, request))
            .ReturnsAsync(expected);

        // Act
        var result = await _controller.UpdateCurrentUser(request);

        // Assert
        result.Should().BeOfType<OkObjectResult>();
        var okResult = result as OkObjectResult;
        okResult!.Value.Should().BeEquivalentTo(expected);
        _mockUserService.Verify(x => x.UpdateProfileAsync(_testUserId, request), Times.Once);
    }

    [Fact]
    public async Task UpdateCurrentUser_WithoutClaims_ShouldReturnUnauthorized()
    {
        // Arrange - no NameIdentifier claim
        var anonymous = new ClaimsPrincipal(new ClaimsIdentity(new Claim[] { }, "test"));
        _controller.ControllerContext = new ControllerContext
        {
            HttpContext = new DefaultHttpContext { User = anonymous }
        };

        // Act
        var result = await _controller.UpdateCurrentUser(new UpdateProfileRequestDto { Name = "X" });

        // Assert
        result.Should().BeOfType<UnauthorizedObjectResult>();
        _mockUserService.Verify(x => x.UpdateProfileAsync(It.IsAny<int>(), It.IsAny<UpdateProfileRequestDto>()), Times.Never);
    }
}