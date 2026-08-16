using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FounderMate.Api.Models;

public class Application
{
    public int Id { get; set; }

    public int ProjectId { get; set; }

    [ForeignKey("ProjectId")]
    public Project Project { get; set; } = null!;

    public int ApplicantId { get; set; }

    [ForeignKey("ApplicantId")]
    public User Applicant { get; set; } = null!;

    [MaxLength(200)]
    public string? SelectedRole { get; set; }

    [MaxLength(600)]
    public string? Motivation { get; set; }

    [MaxLength(800)]
    public string? Contribution { get; set; }

    [MaxLength(400)]
    public string? FirstSprintProposal { get; set; }

    [MaxLength(50)]
    public string? WeeklyAvailability { get; set; }

    [MaxLength(50)]
    public string? CommitmentPreference { get; set; }

    [MaxLength(500)]
    public string? CompensationPreferences { get; set; }

    [MaxLength(2048)]
    public string? PortfolioUrl { get; set; }

    [Required, MaxLength(20)]
    public string Status { get; set; } = "Draft"; // Draft, Pending, Accepted, Rejected, Withdrawn

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? UpdatedAt { get; set; }
    public DateTime? SubmittedAt { get; set; }
    public DateTime? ReviewedAt { get; set; }
}