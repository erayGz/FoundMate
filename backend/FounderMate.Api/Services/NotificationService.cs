using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Notification;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<NotificationService> _logger;

    public NotificationService(AppDbContext context, ILogger<NotificationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<PaginatedResponse<NotificationResponseDto>> GetMyNotificationsAsync(int userId, int page = 1, int pageSize = 20, bool? unreadOnly = null)
    {
        var query = _context.Notifications.Where(n => n.UserId == userId);

        if (unreadOnly == true)
        {
            query = query.Where(n => !n.IsRead);
        }

        var totalCount = await query.CountAsync();
        var notifications = await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<NotificationResponseDto>
        {
            Items = notifications.Select(n => n.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<int> GetUnreadCountAsync(int userId)
    {
        return await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .CountAsync();
    }

    public async Task<bool> MarkAsReadAsync(int userId, int notificationId)
    {
        var notification = await _context.Notifications
            .FirstOrDefaultAsync(n => n.Id == notificationId && n.UserId == userId);

        if (notification is null || notification.IsRead)
        {
            return false;
        }

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<int> MarkMultipleAsReadAsync(int userId, List<int> notificationIds)
    {
        if (notificationIds.Count == 0)
        {
            return 0;
        }

        var notifications = await _context.Notifications
            .Where(n => n.UserId == userId && notificationIds.Contains(n.Id) && !n.IsRead)
            .ToListAsync();

        foreach (var notification in notifications)
        {
            notification.IsRead = true;
            notification.ReadAt = DateTime.UtcNow;
        }

        await _context.SaveChangesAsync();
        return notifications.Count;
    }

    public async Task<NotificationResponseDto?> CreateAsync(int userId, string type, string title, string? message = null, int? relatedEntityId = null, string? relatedEntityType = null)
    {
        var notification = new Notification
        {
            UserId = userId,
            Type = type,
            Title = title,
            Message = message,
            RelatedEntityId = relatedEntityId,
            RelatedEntityType = relatedEntityType,
        };

        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Notification {NotificationId} created for User {UserId}: {Type}", notification.Id, userId, type);

        return notification.ToDto();
    }

    public async Task NotifyTaskAssignedAsync(int assigneeId, int taskId, string taskTitle, int assignedByUserId)
    {
        var assigner = await _context.Users.FindAsync(assignedByUserId);
        var assignerName = assigner?.Name ?? "Someone";

        await CreateAsync(assigneeId, "TaskAssigned", "Task Assigned", 
            $"{assignerName} assigned you to task \"{taskTitle}\"", taskId, "Task");
    }

    public async Task NotifyTaskUpdatedAsync(int userId, int taskId, string taskTitle, string changeDescription)
    {
        await CreateAsync(userId, "TaskUpdated", "Task Updated",
            $"Task \"{taskTitle}\" was updated: {changeDescription}", taskId, "Task");
    }

    public async Task NotifyCommentAddedAsync(int userId, int taskId, string taskTitle, int commentAuthorId, string commentAuthorName)
    {
        if (userId == commentAuthorId) return; // Don't notify yourself

        await CreateAsync(userId, "CommentAdded", "New Comment",
            $"{commentAuthorName} commented on task \"{taskTitle}\"", taskId, "Task");
    }

    public async Task NotifyTeamInvitedAsync(int userId, int teamId, string teamName, int invitedByUserId)
    {
        var inviter = await _context.Users.FindAsync(invitedByUserId);
        var inviterName = inviter?.Name ?? "Someone";

        await CreateAsync(userId, "TeamInvited", "Team Invitation",
            $"{inviterName} invited you to join team \"{teamName}\"", teamId, "Team");
    }

    public async Task NotifyMentionedAsync(int userId, int taskId, string taskTitle, int mentionedByUserId)
    {
        var mentioner = await _context.Users.FindAsync(mentionedByUserId);
        var mentionerName = mentioner?.Name ?? "Someone";

        await CreateAsync(userId, "Mentioned", "You were mentioned",
            $"{mentionerName} mentioned you in task \"{taskTitle}\"", taskId, "Task");
    }
}