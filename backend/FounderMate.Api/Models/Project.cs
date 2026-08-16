using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class Project
{
    public int Id { get; set; }

    [Required, MaxLength(200)]
    public string Title { get; set; } = string.Empty;

    [Required, MinLength(50), MaxLength(2000)]
    public string Description { get; set; } = string.Empty;

    public string? Category { get; set; }
    [Required, MaxLength(200)]
    public int OwnerId { get; set; }
    
    [ForeignKey("OwnerId")]
    public User Owner { get; set; } = null!;

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }

    public ICollection<ProjectMember> Members { get; set; } = new List<ProjectMember>();
}
