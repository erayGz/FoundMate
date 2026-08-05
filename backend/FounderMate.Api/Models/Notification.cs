using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class Notification
{
    public int Id { get; set; }

    public int UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [Required, MaxLength(50)]
    public string Type { get; set; } = string.Empty; // TaskAssigned, TaskUpdated, CommentAdded, TeamInvited, Mentioned

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(1000)]
    public string? Message { get; set; }

    public int? RelatedEntityId { get; set; } // TaskId, TeamId, ProjectId, CommentId
    public string? RelatedEntityType { get; set; } // Task, Team, Project, Comment

    public bool IsRead { get; set; } = false;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? ReadAt { get; set; }
}