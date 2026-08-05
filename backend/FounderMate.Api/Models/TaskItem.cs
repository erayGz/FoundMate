using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class TaskItem
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [MaxLength(5000)]
    public string? Description { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Todo"; // Todo, InProgress, InReview, Done

    [MaxLength(20)]
    public string? Priority { get; set; } = "Medium"; // Low, Medium, High, Critical

    public int ProjectId { get; set; }
    
    [ForeignKey("ProjectId")]
    public Project Project { get; set; } = null!;

    public int? TeamId { get; set; }
    
    [ForeignKey("TeamId")]
    public Team? Team { get; set; }

    public int? AssigneeId { get; set; }
    
    [ForeignKey("AssigneeId")]
    public User? Assignee { get; set; }

    public int ReporterId { get; set; }
    
    [ForeignKey("ReporterId")]
    public User Reporter { get; set; } = null!;

    public DateTime? DueDate { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }

    public ICollection<TaskComment> Comments { get; set; } = new List<TaskComment>();
}