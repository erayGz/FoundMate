using FounderMate.Api.DTOs.Notification;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class NotificationMapper
{
    public static NotificationResponseDto ToDto(this Notification notification)
    {
        return new NotificationResponseDto
        {
            Id = notification.Id,
            Type = notification.Type,
            Title = notification.Title,
            Message = notification.Message,
            RelatedEntityId = notification.RelatedEntityId,
            RelatedEntityType = notification.RelatedEntityType,
            IsRead = notification.IsRead,
            CreatedAt = notification.CreatedAt,
            ReadAt = notification.ReadAt
        };
    }
}