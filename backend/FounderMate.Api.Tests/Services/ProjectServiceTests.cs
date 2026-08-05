using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using FounderMate.Api.Services;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;

namespace FounderMate.Api.Tests;

public class ProjectServiceTests : TestBase
{
    private readonly IProjectService _projectService;

    public ProjectServiceTests()
    {
        _projectService = new ProjectService(Context, Mock.Of<ILogger<ProjectService>>());
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateProject()
    {
        // Arrange
        var owner = CreateTestUser("projectowner@example.com", "Project Owner");
        var request = new ProjectCreateRequestDto
        {
            Title = "My New Project",
            Description = "This is a detailed description of my new project that meets the minimum length requirement.",
            Category = "SaaS"
        };

        // Act
        var result = await _projectService.CreateAsync(owner.Id, request);

        // Assert
        result.Should().NotBeNull();
        result.Title.Should().Be(request.Title);
        result.Description.Should().Be(request.Description);
        result.Category.Should().Be(request.Category);
        result.OwnerId.Should().Be(owner.Id);

        var projectInDb = await Context.Projects.FirstOrDefaultAsync(p => p.Id == result.Id);
        projectInDb.Should().NotBeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingProject_ShouldReturnProject()
    {
        // Arrange
        var owner = CreateTestUser("getproject@example.com", "Get Project Owner");
        var project = CreateTestProject(owner.Id, "Existing Project");

        // Act
        var result = await _projectService.GetByIdAsync(project.Id);

        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(project.Id);
        result.Title.Should().Be(project.Title);
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentProject_ShouldReturnNull()
    {
        // Act
        var result = await _projectService.GetByIdAsync(99999);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetAllAsync_ShouldReturnPaginatedResults()
    {
        // Arrange
        var owner = CreateTestUser("listprojects@example.com", "List Projects Owner");
        for (int i = 1; i <= 5; i++)
        {
            CreateTestProject(owner.Id, $"Project {i}");
        }

        // Act
        var result = await _projectService.GetAllAsync(page: 1, pageSize: 3);

        // Assert
        result.Should().NotBeNull();
        result.Items.Should().HaveCount(3);
        result.TotalCount.Should().Be(5);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(3);
        result.TotalPages.Should().Be(2);
    }

    [Fact]
    public async Task GetAllAsync_WithSearch_ShouldFilterResults()
    {
        // Arrange - use a fresh owner to avoid test pollution
        var owner = CreateTestUser("searchprojects2@example.com", "Search Projects Owner 2");
        CreateTestProject(owner.Id, "Alpha Project");
        CreateTestProject(owner.Id, "Beta Project");
        CreateTestProject(owner.Id, "Gamma App");

        // Act - search for "Alpha" which only appears in title, not in shared description
        var result = await _projectService.GetAllAsync(page: 1, pageSize: 10, search: "Alpha");

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Title.Should().Be("Alpha Project");
    }

    [Fact]
    public async Task GetAllAsync_WithCategory_ShouldFilterResults()
    {
        // Arrange
        var owner = CreateTestUser("categoryprojects@example.com", "Category Projects Owner");
        var p1 = CreateTestProject(owner.Id, "SaaS Project 1");
        p1.Category = "SaaS";
        var p2 = CreateTestProject(owner.Id, "Mobile Project");
        p2.Category = "Mobile";
        var p3 = CreateTestProject(owner.Id, "Web Project");
        p3.Category = "Web";
        Context.SaveChanges();

        // Act
        var result = await _projectService.GetAllAsync(page: 1, pageSize: 10, category: "SaaS");

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Category.Should().Be("SaaS");
    }

    [Fact]
    public async Task GetMyProjectsAsync_ShouldReturnOnlyOwnedProjects()
    {
        // Arrange
        var owner1 = CreateTestUser("owner1@example.com", "Owner 1");
        var owner2 = CreateTestUser("owner2@example.com", "Owner 2");
        CreateTestProject(owner1.Id, "Owner 1 Project");
        CreateTestProject(owner2.Id, "Owner 2 Project");

        // Act
        var result = await _projectService.GetMyProjectsAsync(owner1.Id);

        // Assert
        result.Items.Should().HaveCount(1);
        result.Items.First().Title.Should().Be("Owner 1 Project");
    }

    [Fact]
    public async Task UpdateAsync_ByOwner_ShouldUpdateProject()
    {
        // Arrange
        var owner = CreateTestUser("updateowner@example.com", "Update Owner");
        var project = CreateTestProject(owner.Id, "Original Title");
        var request = new ProjectUpdateRequestDto
        {
            Title = "Updated Title",
            Description = "Updated description that is long enough to meet requirements.",
            Category = "AI"
        };

        // Act
        var result = await _projectService.UpdateAsync(owner.Id, project.Id, request);

        // Assert
        result.Should().NotBeNull();
        result!.Title.Should().Be("Updated Title");
        result.Category.Should().Be("AI");
    }

    [Fact]
    public async Task UpdateAsync_ByNonOwner_ShouldReturnNull()
    {
        // Arrange
        var owner = CreateTestUser("realowner@example.com", "Real Owner");
        var otherUser = CreateTestUser("other@example.com", "Other User");
        var project = CreateTestProject(owner.Id, "Owner's Project");
        var request = new ProjectUpdateRequestDto { Title = "Hacked Title" };

        // Act
        var result = await _projectService.UpdateAsync(otherUser.Id, project.Id, request);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ByOwner_ShouldDeleteProject()
    {
        // Arrange
        var owner = CreateTestUser("deleteowner@example.com", "Delete Owner");
        var project = CreateTestProject(owner.Id, "Project to Delete");

        // Act
        var result = await _projectService.DeleteAsync(owner.Id, project.Id);

        // Assert
        result.Should().BeTrue();
        var deletedProject = await Context.Projects.FindAsync(project.Id);
        deletedProject.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_ByNonOwner_ShouldReturnFalse()
    {
        // Arrange
        var owner = CreateTestUser("deleteowner2@example.com", "Delete Owner 2");
        var otherUser = CreateTestUser("other2@example.com", "Other User 2");
        var project = CreateTestProject(owner.Id, "Owner's Project");

        // Act
        var result = await _projectService.DeleteAsync(otherUser.Id, project.Id);

        // Assert
        result.Should().BeFalse();
        var stillExists = await Context.Projects.FindAsync(project.Id);
        stillExists.Should().NotBeNull();
    }
}