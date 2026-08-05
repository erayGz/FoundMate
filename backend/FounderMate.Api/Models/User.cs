using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.Models;

public class User
{
    public int Id { get; set; }

    [Required, MaxLength(256)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string PasswordHash { get; set; } = string.Empty;

    [Required, MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Required, MaxLength(50)]
    public string Role { get; set; } = "User";

    [MaxLength(200)]
    public string? Headline { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? PasswordChangedAt { get; set; }

    public ICollection<Project> Projects { get; set; } = new List<Project>();
    public ICollection<TeamMember> TeamMemberships { get; set; } = new List<TeamMember>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
