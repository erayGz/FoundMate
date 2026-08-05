using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class TeamMember
{
    public int Id { get; set; }

    public int TeamId { get; set; }
    
    [ForeignKey("TeamId")]
    public Team Team { get; set; } = null!;

    public int UserId { get; set; }
    
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;

    [Required, MaxLength(20)]
    public string Role { get; set; } = "Member"; // Owner, Admin, Member

    public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
}