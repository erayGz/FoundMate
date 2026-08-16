using System.ComponentModel.DataAnnotations;

namespace FounderMate.Api.DTOs.Application;

public class ApplicationUpsertRequestDto
{
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

    public List<string> CompensationPreferences { get; set; } = new();

    [MaxLength(2048)]
    public string? PortfolioUrl { get; set; }

    [RegularExpression("^(Draft|Pending)$", ErrorMessage = "Status must be Draft or Pending.")]
    public string Status { get; set; } = "Draft";
}

public class ApplicationResponseDto
{
    public int Id { get; init; }
    public int ProjectId { get; init; }
    public string ProjectTitle { get; init; } = string.Empty;
    public int ApplicantId { get; init; }
    public string ApplicantName { get; init; } = string.Empty;
    public string ApplicantEmail { get; init; } = string.Empty;
    public string? SelectedRole { get; init; }
    public string? Motivation { get; init; }
    public string? Contribution { get; init; }
    public string? FirstSprintProposal { get; init; }
    public string? WeeklyAvailability { get; init; }
    public string? CommitmentPreference { get; init; }
    public List<string> CompensationPreferences { get; init; } = new();
    public string? PortfolioUrl { get; init; }
    public string Status { get; init; } = "Draft";
    public DateTime CreatedAt { get; init; }
    public DateTime? UpdatedAt { get; init; }
    public DateTime? SubmittedAt { get; init; }
    public DateTime? ReviewedAt { get; init; }
}