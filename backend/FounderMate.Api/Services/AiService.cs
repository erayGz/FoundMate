using Azure.AI.OpenAI;
using FounderMate.Api.Config;
using FounderMate.Api.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;
using OpenAI.Chat;
using System.ClientModel;

namespace FounderMate.Api.Services;

public class AiService : IAiService
{
    private readonly AiSettings _settings;
    private readonly ILogger<AiService> _logger;
    private readonly IHostEnvironment _env;

    public AiService(IOptions<AiSettings> settings, ILogger<AiService> logger, IHostEnvironment env)
    {
        _settings = settings.Value;
        _logger = logger;
        _env = env;
    }

    public async Task<string?> GenerateProjectIdeasAsync(string interests, string skills, int count = 5)
    {
        var prompt = $@"Generate {count} startup project ideas for a founder with these interests: {interests} and skills: {skills}.";
        return await CallAiAsync(prompt, "You are a startup advisor helping founders generate project ideas.");
    }

    public async Task<string?> GenerateTaskBreakdownAsync(string projectTitle, string projectDescription, int taskCount = 8)
    {
        var prompt = $@"Break down this project into {taskCount} actionable tasks:

Project: {projectTitle}
Description: {projectDescription}";

        return await CallAiAsync(prompt, "You are a project manager helping break down projects into tasks.");
    }

    public async Task<string?> SummarizeProjectAsync(string projectTitle, string projectDescription, List<string> taskTitles)
    {
        var tasksText = string.Join("\n- ", taskTitles);
        var prompt = $@"Summarize this project for a stakeholder update:

Project: {projectTitle}
Description: {projectDescription}
Current Tasks:
- {tasksText}";

        return await CallAiAsync(prompt, "You are a project manager creating stakeholder summaries.");
    }

    public async Task<string?> ImproveTaskDescriptionAsync(string currentDescription, string context)
    {
        var prompt = $@"Improve this task description to be more clear, actionable, and complete:

Current Description: {currentDescription}
Context: {context}";

        return await CallAiAsync(prompt, "You are a senior developer helping write better task descriptions.");
    }

    public async Task<string?> SuggestTaskPrioritiesAsync(List<string> taskTitles, List<string> taskDescriptions)
    {
        var tasksText = "";
        for (int i = 0; i < taskTitles.Count; i++)
        {
            tasksText += $"{i + 1}. {taskTitles[i]}: {taskDescriptions[i]}\n";
        }

        var prompt = $@"Prioritize these tasks for a startup project:

{tasksText}";

        return await CallAiAsync(prompt, "You are a product manager prioritizing tasks for a startup.");
    }

    public async Task<string?> GenerateStandupSummaryAsync(string userName, List<string> completedTasks, List<string> inProgressTasks, List<string> blockers)
    {
        var completed = string.Join("\n- ", completedTasks);
        var inProgress = string.Join("\n- ", inProgressTasks);
        var block = string.Join("\n- ", blockers);

        var prompt = $@"Generate a daily standup summary for {userName}:

Completed:
- {completed}

In Progress:
- {inProgress}

Blockers:
- {block}";

        return await CallAiAsync(prompt, "You are a Scrum Master helping with daily standup summaries.");
    }

    private async Task<string?> CallAiAsync(string userPrompt, string systemPrompt)
    {
        if (!_settings.Enabled || string.IsNullOrWhiteSpace(_settings.ApiKey))
        {
            if (_env.IsDevelopment())
            {
                _logger.LogInformation("AI service not configured (missing API key). Returning mock response (development only).");
                return GetMockResponse(userPrompt);
            }

            throw new InvalidOperationException(
                "AI service is not configured. Set Ai__ApiKey (and Ai__Enabled=true) to enable real AI responses.");
        }

        try
        {
            return await CompleteAsync(systemPrompt, userPrompt);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "AI service call failed");

            if (_env.IsDevelopment())
            {
                _logger.LogInformation("Returning mock response after AI failure (development only).");
                return GetMockResponse(userPrompt);
            }

            throw;
        }
    }

    private async Task<string?> CompleteAsync(string systemPrompt, string userPrompt)
    {
        var messages = new List<ChatMessage>
        {
            new SystemChatMessage(systemPrompt),
            new UserChatMessage(userPrompt)
        };

        var options = new ChatCompletionOptions
        {
            MaxOutputTokenCount = _settings.MaxTokens,
            Temperature = _settings.Temperature,
        };

        if (string.Equals(_settings.Provider, "AzureOpenAI", StringComparison.OrdinalIgnoreCase))
        {
            if (string.IsNullOrWhiteSpace(_settings.Endpoint) || string.IsNullOrWhiteSpace(_settings.DeploymentName))
            {
                throw new InvalidOperationException("AI service (AzureOpenAI) requires Ai:Endpoint and Ai:DeploymentName.");
            }

            var azureClient = new AzureOpenAIClient(new Uri(_settings.Endpoint), new ApiKeyCredential(_settings.ApiKey));
            var azureChat = azureClient.GetChatClient(_settings.DeploymentName);
            return await CompleteChatAsync(azureChat, messages, options);
        }

        var chatClient = new ChatClient(_settings.Model, _settings.ApiKey);
        return await CompleteChatAsync(chatClient, messages, options);
    }

    private static async Task<string?> CompleteChatAsync(ChatClient client, List<ChatMessage> messages, ChatCompletionOptions options)
    {
        var completion = await client.CompleteChatAsync(messages, options);
        return completion.Value.Content[0].Text;
    }

    private string GetMockResponse(string prompt)
    {
        if (prompt.Contains("project ideas"))
        {
            return @"1. **SkillSwap Platform** - A marketplace for professionals to trade skills instead of money
   - Target: Freelancers, career switchers, hobbyists
   - Features: Skill profiles, matching algorithm, video sessions, rating system
   - Complexity: Medium
   - Monetization: Subscription + transaction fees

2. **Micro-SaaS Analytics** - Simple analytics for solo founders who don't need GA4 complexity
   - Target: Indie hackers, small SaaS founders
   - Features: Event tracking, funnels, retention cohorts, email reports
   - Complexity: Low
   - Monetization: Freemium + pro tiers";
        }

        if (prompt.Contains("Break down this project"))
        {
            return @"1. **Set up project repository and CI/CD** - Initialize repo, configure GitHub Actions
   Status: Todo | Priority: High | Effort: Small

2. **Design database schema** - Create ERD, define tables, relationships
   Status: Todo | Priority: High | Effort: Medium

3. **Implement authentication** - JWT auth, register/login, password reset
   Status: Todo | Priority: Critical | Effort: Medium

4. **Build core API endpoints** - CRUD for main entities
   Status: Todo | Priority: High | Effort: Large

5. **Create frontend scaffold** - React + TypeScript + routing
   Status: Todo | Priority: High | Effort: Medium

6. **Implement UI for core features** - Forms, lists, dashboards
   Status: Todo | Priority: Medium | Effort: Large

7. **Add testing** - Unit + integration tests
   Status: Todo | Priority: Medium | Effort: Medium

8. **Deploy to production** - Configure hosting, SSL, monitoring
   Status: Todo | Priority: Critical | Effort: Small";
        }

        if (prompt.Contains("Summarize this project"))
        {
            return "Project is progressing well with core infrastructure complete. Authentication and API layer are done. Frontend development is 60% complete. Next sprint focuses on UI polish and testing. Main risk: third-party API rate limits.";
        }

        if (prompt.Contains("Improve this task description"))
        {
            return "## Objective\nImplement user authentication with JWT tokens.\n\n## Acceptance Criteria\n- User can register with email/password\n- User can login and receive JWT token\n- Token expires in 24 hours\n- Password reset via email works\n- Invalid tokens return 401\n\n## Technical Notes\n- Use BCrypt for password hashing\n- Store refresh tokens in DB\n- Implement token blacklist for logout\n\n## Dependencies\n- Email service for verification\n- Database migration for user table";
        }

        if (prompt.Contains("Prioritize these tasks"))
        {
            return "1. Set up authentication - Critical - Blocks all user-facing features\n2. Design database schema - High - Required for all data operations\n3. Build core API endpoints - High - Enables frontend development\n4. Create frontend scaffold - Medium - Can start in parallel with API\n5. Implement UI for core features - Medium - Depends on API completion\n6. Add testing - Medium - Can be done incrementally\n7. Deploy to production - Critical - Required for launch\n8. Set up project repository - Low - Can be done anytime";
        }

        if (prompt.Contains("standup summary"))
        {
            return "Yesterday: Completed user authentication API and database schema. Today: Building task CRUD endpoints and starting frontend task board. Blockers: Need design review for task card component - waiting on designer feedback.";
        }

        return "AI service response (mock mode - configure API key for real responses)";
    }
}
