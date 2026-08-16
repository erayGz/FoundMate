using FounderMate.Api.Controllers;
using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;
using System.Security.Claims;

namespace FounderMate.Api.Tests;

public class ProjectsControllerTests
{
    private readonly Mock<IProjectService> _mockProjectService;
    private readonly ProjectsController _controller;
    private readonly int _testUserId = 1;

    public ProjectsControllerTests()
    {
        _mockProjectService = new Mock<IProjectService>();
        _controller = new ProjectsController(_mockProjectService.Object);
        
        // Set up user claims
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
    public async Task Create_WithValidRequest_ShouldReturnCreated()
    {
        // Arrange
        var request = new ProjectCreateRequestDto
        {
            Title = "Test Project",
            Description = "A test project description that meets minimum length requirements.",
            Category = "SaaS"
        };
        var expectedProject = new ProjectResponseDto
        {
            Id = 1,
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            OwnerId = _testUserId,
            CreatedAt = DateTime.UtcNow
        };
        _mockProjectService.Setup(x => x.CreateAsync(_testUserId, request))
            .ReturnsAsync(expectedProject);

        // Act
        var result = await _controller.Create(request);

        // Assert
        var createdResult = result.Should().BeOfType<CreatedAtActionResult>().Subject;
        createdResult.Value.Should().BeEquivalentTo(expectedProject);
        createdResult.ActionName.Should().Be(nameof(ProjectsController.GetById));
    }

    [Fact]
    public async Task GetById_WithExistingProject_ShouldReturnOk()
    {
        // Arrange
        var project = new ProjectResponseDto { Id = 1, Title = "Test", OwnerId = _testUserId };
        _mockProjectService.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(project);

        // Act
        var result = await _controller.GetById(1);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(project);
    }

    [Fact]
    public async Task GetById_WithNonExistentProject_ShouldReturnNotFound()
    {
        // Arrange
        _mockProjectService.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((ProjectResponseDto?)null);

        // Act
        var result = await _controller.GetById(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task GetAll_ShouldReturnPaginatedResults()
    {
        // Arrange
        var paginated = new FounderMate.Api.DTOs.Common.PaginatedResponse<ProjectResponseDto>
        {
            Items = new List<ProjectResponseDto> { new() { Id = 1, Title = "P1" }, new() { Id = 2, Title = "P2" } },
            TotalCount = 2,
            Page = 1,
            PageSize = 10,
            TotalPages = 1
        };
        _mockProjectService.Setup(x => x.GetAllAsync(1, 10, null, null)).ReturnsAsync(paginated);

        // Act
        var result = await _controller.GetAll();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(paginated);
    }

    [Fact]
    public async Task GetMyProjects_ShouldReturnUserProjects()
    {
        // Arrange
        var paginated = new FounderMate.Api.DTOs.Common.PaginatedResponse<ProjectResponseDto>
        {
            Items = new List<ProjectResponseDto> { new() { Id = 1, Title = "My Project", OwnerId = _testUserId } },
            TotalCount = 1,
            Page = 1,
            PageSize = 10,
            TotalPages = 1
        };
        _mockProjectService.Setup(x => x.GetMyProjectsAsync(_testUserId, 1, 10, null)).ReturnsAsync(paginated);

        // Act
        var result = await _controller.GetMyProjects();

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(paginated);
    }

    [Fact]
    public async Task Update_ByOwner_ShouldReturnOk()
    {
        // Arrange
        var request = new ProjectUpdateRequestDto { Title = "Updated Title" };
        var updatedProject = new ProjectResponseDto { Id = 1, Title = "Updated Title", OwnerId = _testUserId };
        _mockProjectService.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(updatedProject);
        _mockProjectService.Setup(x => x.UpdateAsync(_testUserId, 1, request)).ReturnsAsync(updatedProject);

        // Act
        var result = await _controller.Update(1, request);

        // Assert
        var okResult = result.Should().BeOfType<OkObjectResult>().Subject;
        okResult.Value.Should().BeEquivalentTo(updatedProject);
    }

    [Fact]
    public async Task Update_ByNonOwner_ShouldReturnForbid()
    {
        // Arrange
        var project = new ProjectResponseDto { Id = 1, Title = "Test", OwnerId = _testUserId };
        var request = new ProjectUpdateRequestDto { Title = "Hacked" };
        _mockProjectService.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(project);
        _mockProjectService.Setup(x => x.UpdateAsync(999, 1, request)).ReturnsAsync((ProjectResponseDto?)null);

        // Act - use a different user ID
        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "999")
        }, "test"));
        _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        var result = await _controller.Update(1, request);

        // Assert
        result.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task Update_WithNonExistentProject_ShouldReturnNotFound()
    {
        // Arrange
        _mockProjectService.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((ProjectResponseDto?)null);

        // Act
        var result = await _controller.Update(999, new ProjectUpdateRequestDto { Title = "Nope" });

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }

    [Fact]
    public async Task Delete_ByOwner_ShouldReturnNoContent()
    {
        // Arrange
        var project = new ProjectResponseDto { Id = 1, Title = "Test", OwnerId = _testUserId };
        _mockProjectService.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(project);
        _mockProjectService.Setup(x => x.DeleteAsync(_testUserId, 1)).ReturnsAsync(true);

        // Act
        var result = await _controller.Delete(1);

        // Assert
        result.Should().BeOfType<NoContentResult>();
    }

    [Fact]
    public async Task Delete_ByNonOwner_ShouldReturnForbid()
    {
        // Arrange
        var project = new ProjectResponseDto { Id = 1, Title = "Test", OwnerId = _testUserId };
        _mockProjectService.Setup(x => x.GetByIdAsync(1)).ReturnsAsync(project);
        _mockProjectService.Setup(x => x.DeleteAsync(999, 1)).ReturnsAsync(false);

        var user = new ClaimsPrincipal(new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.NameIdentifier, "999")
        }, "test"));
        _controller.ControllerContext = new ControllerContext { HttpContext = new DefaultHttpContext { User = user } };

        // Act
        var result = await _controller.Delete(1);

        // Assert
        result.Should().BeOfType<ForbidResult>();
    }

    [Fact]
    public async Task Delete_WithNonExistentProject_ShouldReturnNotFound()
    {
        // Arrange
        _mockProjectService.Setup(x => x.GetByIdAsync(999)).ReturnsAsync((ProjectResponseDto?)null);

        // Act
        var result = await _controller.Delete(999);

        // Assert
        result.Should().BeOfType<NotFoundResult>();
    }
}