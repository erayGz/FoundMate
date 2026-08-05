using System.Security.Claims;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Notification;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Swashbuckle.AspNetCore.Annotations;

namespace FounderMate.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
[SwaggerTag("Notifications - User notifications")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _notificationService;

    public NotificationsController(INotificationService notificationService)
    {
        _notificationService = notificationService;
    }

    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<NotificationResponseDto>), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "Get my notifications", Description = "Returns paginated list of notifications for the authenticated user. Filter by unreadOnly.")]
    public async Task<IActionResult> GetMyNotifications(
        [FromQuery][SwaggerParameter("Page number (1-based)")] int page = 1,
        [FromQuery][SwaggerParameter("Items per page")] int pageSize = 20,
        [FromQuery][SwaggerParameter("Filter to show only unread notifications")] bool? unreadOnly = null)
    {
        var userId = GetUserId();
        var notifications = await _notificationService.GetMyNotificationsAsync(userId, page, pageSize, unreadOnly);
        return Ok(notifications);
    }

    [HttpGet("unread-count")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "Get unread count", Description = "Returns the count of unread notifications for the authenticated user.")]
    public async Task<IActionResult> GetUnreadCount()
    {
        var userId = GetUserId();
        var count = await _notificationService.GetUnreadCountAsync(userId);
        return Ok(new { count });
    }

    [HttpPut("{id:int}/read")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    [SwaggerOperation(Summary = "Mark notification as read", Description = "Marks a single notification as read.")]
    public async Task<IActionResult> MarkAsRead([SwaggerParameter("Notification ID")] int id)
    {
        var userId = GetUserId();
        var success = await _notificationService.MarkAsReadAsync(userId, id);
        return success ? Ok(new { message = "Notification marked as read." }) : NotFound();
    }

    [HttpPut("read")]
    [ProducesResponseType(typeof(int), StatusCodes.Status200OK)]
    [SwaggerOperation(Summary = "Mark multiple notifications as read", Description = "Marks multiple notifications as read by their IDs.")]
    public async Task<IActionResult> MarkMultipleAsRead([FromBody] MarkNotificationsReadRequestDto request)
    {
        var userId = GetUserId();
        var count = await _notificationService.MarkMultipleAsReadAsync(userId, request.NotificationIds);
        return Ok(new { markedCount = count });
    }

    private int GetUserId()
    {
        var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(userIdStr, out var id) ? id : 0;
    }
}