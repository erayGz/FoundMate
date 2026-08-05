using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Notification;

namespace FounderMate.Api.Interfaces;

public interface INotificationService
{
    Task<PaginatedResponse<NotificationResponseDto>> GetMyNotificationsAsync(int userId, int page = 1, int pageSize = 20, bool? unreadOnly = null);
    Task<int> GetUnreadCountAsync(int userId);
    Task<bool> MarkAsReadAsync(int userId, int notificationId);
    Task<int> MarkMultipleAsReadAsync(int userId, List<int> notificationIds);
    Task<NotificationResponseDto?> CreateAsync(int userId, string type, string title, string? message = null, int? relatedEntityId = null, string? relatedEntityType = null);
    
    // Convenience methods for common notification types
    Task NotifyTaskAssignedAsync(int assigneeId, int taskId, string taskTitle, int assignedByUserId);
    Task NotifyTaskUpdatedAsync(int userId, int taskId, string taskTitle, string changeDescription);
    Task NotifyCommentAddedAsync(int userId, int taskId, string taskTitle, int commentAuthorId, string commentAuthorName);
    Task NotifyTeamInvitedAsync(int userId, int teamId, string teamName, int invitedByUserId);
    Task NotifyMentionedAsync(int userId, int taskId, string taskTitle, int mentionedByUserId);
}