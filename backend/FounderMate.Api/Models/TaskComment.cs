using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class TaskComment
{
    public int Id { get; set; }

    [Required, MaxLength(5000)]
    public string Content { get; set; } = string.Empty;

    public int TaskId { get; set; }
    
    [ForeignKey("TaskId")]
    public TaskItem Task { get; set; } = null!;

    public int AuthorId { get; set; }
    
    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
}