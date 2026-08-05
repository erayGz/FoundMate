using FounderMate.Api.Config;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Services;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using Moq;
using FluentAssertions;
using Xunit;

namespace FounderMate.Api.Tests;

public class AiServiceTests
{
    private readonly IAiService _aiService;

    public AiServiceTests()
    {
        var settings = Options.Create(new AiSettings
        {
            Enabled = true,
            ApiKey = "", // Empty = mock mode
            Model = "gpt-4o-mini",
            MaxTokens = 2000,
            Temperature = 0.7f
        });
        
        _aiService = new AiService(settings, Mock.Of<ILogger<AiService>>());
    }

    [Fact]
    public async Task GenerateProjectIdeasAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.GenerateProjectIdeasAsync("AI, SaaS", "Python, React", 2);

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("SkillSwap");
        result.Should().Contain("Micro-SaaS");
    }

    [Fact]
    public async Task GenerateTaskBreakdownAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.GenerateTaskBreakdownAsync("Test Project", "A test project description");

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("Set up project repository");
        result.Should().Contain("Design database schema");
        result.Should().Contain("Implement authentication");
    }

    [Fact]
    public async Task SummarizeProjectAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.SummarizeProjectAsync("Test Project", "Description", new List<string> { "Task 1", "Task 2" });

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("progressing well");
    }

    [Fact]
    public async Task ImproveTaskDescriptionAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.ImproveTaskDescriptionAsync("Fix login bug", "Auth module");

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("Objective");
        result.Should().Contain("Acceptance Criteria");
    }

    [Fact]
    public async Task SuggestTaskPrioritiesAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.SuggestTaskPrioritiesAsync(
            new List<string> { "Task 1", "Task 2" },
            new List<string> { "Desc 1", "Desc 2" });

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("Critical");
        result.Should().Contain("authentication");
    }

    [Fact]
    public async Task GenerateStandupSummaryAsync_ShouldReturnMockResponse()
    {
        // Act
        var result = await _aiService.GenerateStandupSummaryAsync(
            "John",
            new List<string> { "Completed task 1" },
            new List<string> { "In progress task 1" },
            new List<string> { "Blocker 1" });

        // Assert
        result.Should().NotBeNullOrEmpty();
        result.Should().Contain("Yesterday");
        result.Should().Contain("Today");
        result.Should().Contain("Blockers");
    }
}