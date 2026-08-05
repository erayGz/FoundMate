namespace FounderMate.Api.DTOs.Notification;

public class NotificationResponseDto
{
    public int Id { get; init; }
    public string Type { get; init; } = string.Empty;
    public string Title { get; init; } = string.Empty;
    public string? Message { get; init; }
    public int? RelatedEntityId { get; init; }
    public string? RelatedEntityType { get; init; }
    public bool IsRead { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime? ReadAt { get; init; }
}

public class MarkNotificationsReadRequestDto
{
    public List<int> NotificationIds { get; set; } = new();
}