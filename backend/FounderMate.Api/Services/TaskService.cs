using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Task;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TaskService> _logger;

    public TaskService(AppDbContext context, ILogger<TaskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TaskResponseDto> CreateAsync(int userId, int projectId, TaskCreateRequestDto request)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project is null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        if (request.TeamId.HasValue)
        {
            var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == request.TeamId && t.ProjectId == projectId);
            if (team is null)
            {
                throw new KeyNotFoundException("Team not found in this project.");
            }
        }

        if (request.AssigneeId.HasValue)
        {
            var assignee = await _context.Users.FindAsync(request.AssigneeId.Value);
            if (assignee is null)
            {
                throw new KeyNotFoundException("Assignee not found.");
            }
        }

        var task = new TaskItem
        {
            Title = request.Title,
            Description = request.Description,
            Status = request.Status,
            Priority = request.Priority,
            ProjectId = projectId,
            TeamId = request.TeamId,
            AssigneeId = request.AssigneeId,
            ReporterId = userId,
            DueDate = request.DueDate,
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Task {TaskId} created in Project {ProjectId} by User {UserId}", task.Id, projectId, userId);

        return task.ToDto();
    }

    public async Task<TaskResponseDto?> GetByIdAsync(int id)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        return task is null ? null : task.ToDto(task.Comments.Count);
    }

    public async Task<PaginatedResponse<TaskResponseDto>> GetByProjectAsync(int projectId, int page = 1, int pageSize = 10, string? status = null, int? assigneeId = null, int? teamId = null)
    {
        var query = _context.Tasks
            .Where(t => t.ProjectId == projectId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        if (assigneeId.HasValue)
        {
            query = query.Where(t => t.AssigneeId == assigneeId.Value);
        }

        if (teamId.HasValue)
        {
            query = query.Where(t => t.TeamId == teamId.Value);
        }

        var totalCount = await query.CountAsync();
        var tasks = await query
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Comments)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<TaskResponseDto>
        {
            Items = tasks.Select(t => t.ToDto(t.Comments.Count)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<PaginatedResponse<TaskResponseDto>> GetMyTasksAsync(int userId, int page = 1, int pageSize = 10, string? status = null)
    {
        var query = _context.Tasks
            .Where(t => t.AssigneeId == userId || t.ReporterId == userId);

        if (!string.IsNullOrWhiteSpace(status))
        {
            query = query.Where(t => t.Status == status);
        }

        var totalCount = await query.CountAsync();
        var tasks = await query
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Comments)
            .OrderByDescending(t => t.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<TaskResponseDto>
        {
            Items = tasks.Select(t => t.ToDto(t.Comments.Count)).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<TaskResponseDto?> UpdateAsync(int userId, int id, TaskUpdateRequestDto request)
    {
        var task = await _context.Tasks
            .Include(t => t.Assignee)
            .Include(t => t.Reporter)
            .Include(t => t.Comments)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (task is null)
        {
            return null;
        }

        if (task.ReporterId != userId && task.AssigneeId != userId)
        {
            return null;
        }

        if (request.TeamId.HasValue)
        {
            var team = await _context.Teams.FirstOrDefaultAsync(t => t.Id == request.TeamId && t.ProjectId == task.ProjectId);
            if (team is null)
            {
                throw new KeyNotFoundException("Team not found in this project.");
            }
        }

        if (request.AssigneeId.HasValue)
        {
            var assignee = await _context.Users.FindAsync(request.AssigneeId.Value);
            if (assignee is null)
            {
                throw new KeyNotFoundException("Assignee not found.");
            }
        }

        var wasNotDone = task.Status != "Done";
        var isNowDone = request.Status == "Done";

        if (request.Title != null) task.Title = request.Title;
        if (request.Description != null) task.Description = request.Description;
        if (request.Status != null) task.Status = request.Status;
        if (request.Priority != null) task.Priority = request.Priority;
        if (request.TeamId.HasValue) task.TeamId = request.TeamId.Value;
        if (request.AssigneeId.HasValue) task.AssigneeId = request.AssigneeId.Value;
        if (request.DueDate.HasValue) task.DueDate = request.DueDate.Value;
        
        task.UpdatedAt = DateTime.UtcNow;

        if (wasNotDone && isNowDone)
        {
            task.CompletedAt = DateTime.UtcNow;
        }
        else if (!isNowDone)
        {
            task.CompletedAt = null;
        }

        await _context.SaveChangesAsync();

        return task.ToDto(task.Comments.Count);
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var task = await _context.Tasks.FindAsync(id);
        if (task is null || task.ReporterId != userId)
        {
            return false;
        }

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<PaginatedResponse<TaskCommentResponseDto>> GetCommentsAsync(int taskId, int page = 1, int pageSize = 10)
    {
        var query = _context.TaskComments
            .Where(c => c.TaskId == taskId)
            .Include(c => c.Author);

        var totalCount = await query.CountAsync();
        var comments = await query
            .OrderBy(c => c.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<TaskCommentResponseDto>
        {
            Items = comments.Select(c => c.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<TaskCommentResponseDto?> AddCommentAsync(int userId, int taskId, TaskCommentCreateRequestDto request)
    {
        var task = await _context.Tasks.FindAsync(taskId);
        if (task is null)
        {
            return null;
        }

        var comment = new TaskComment
        {
            Content = request.Content,
            TaskId = taskId,
            AuthorId = userId,
        };

        _context.TaskComments.Add(comment);
        await _context.SaveChangesAsync();

        return comment.ToDto();
    }

    public async Task<TaskCommentResponseDto?> UpdateCommentAsync(int userId, int commentId, TaskCommentUpdateRequestDto request)
    {
        var comment = await _context.TaskComments
            .Include(c => c.Author)
            .FirstOrDefaultAsync(c => c.Id == commentId);

        if (comment is null || comment.AuthorId != userId)
        {
            return null;
        }

        comment.Content = request.Content;
        comment.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return comment.ToDto();
    }

    public async Task<bool> DeleteCommentAsync(int userId, int commentId)
    {
        var comment = await _context.TaskComments.FindAsync(commentId);
        if (comment is null || comment.AuthorId != userId)
        {
            return false;
        }

        _context.TaskComments.Remove(comment);
        await _context.SaveChangesAsync();
        return true;
    }
}