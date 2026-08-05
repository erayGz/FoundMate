namespace FounderMate.Api.Interfaces;

public interface IAiService
{
    Task<string?> GenerateProjectIdeasAsync(string interests, string skills, int count = 5);
    Task<string?> GenerateTaskBreakdownAsync(string projectTitle, string projectDescription, int taskCount = 8);
    Task<string?> SummarizeProjectAsync(string projectTitle, string projectDescription, List<string> taskTitles);
    Task<string?> ImproveTaskDescriptionAsync(string currentDescription, string context);
    Task<string?> SuggestTaskPrioritiesAsync(List<string> taskTitles, List<string> taskDescriptions);
    Task<string?> GenerateStandupSummaryAsync(string userName, List<string> completedTasks, List<string> inProgressTasks, List<string> blockers);
}