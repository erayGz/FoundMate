using FounderMate.Api.DTOs.Task;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class TaskMapper
{
    public static TaskResponseDto ToDto(this TaskItem task, int commentCount = 0)
    {
        return new TaskResponseDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Status = task.Status,
            Priority = task.Priority,
            ProjectId = task.ProjectId,
            TeamId = task.TeamId,
            AssigneeId = task.AssigneeId,
            AssigneeName = task.Assignee?.Name ?? string.Empty,
            ReporterId = task.ReporterId,
            ReporterName = task.Reporter?.Name ?? string.Empty,
            DueDate = task.DueDate,
            CreatedAt = task.CreatedAt,
            UpdatedAt = task.UpdatedAt,
            CompletedAt = task.CompletedAt,
            CommentCount = commentCount
        };
    }

    public static TaskCommentResponseDto ToDto(this TaskComment comment)
    {
        return new TaskCommentResponseDto
        {
            Id = comment.Id,
            Content = comment.Content,
            TaskId = comment.TaskId,
            AuthorId = comment.AuthorId,
            AuthorName = comment.Author?.Name ?? string.Empty,
            CreatedAt = comment.CreatedAt,
            UpdatedAt = comment.UpdatedAt
        };
    }
}