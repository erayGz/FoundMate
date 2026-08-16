using FounderMate.Api.DTOs.Application;
using FounderMate.Api.Models;

namespace FounderMate.Api.Helpers;

public static class ApplicationMapper
{
    private const char Separator = ',';

    public static ApplicationResponseDto ToDto(this Application application)
    {
        return new ApplicationResponseDto
        {
            Id = application.Id,
            ProjectId = application.ProjectId,
            ProjectTitle = application.Project?.Title ?? string.Empty,
            ApplicantId = application.ApplicantId,
            ApplicantName = application.Applicant?.Name ?? string.Empty,
            ApplicantEmail = application.Applicant?.Email ?? string.Empty,
            SelectedRole = application.SelectedRole,
            Motivation = application.Motivation,
            Contribution = application.Contribution,
            FirstSprintProposal = application.FirstSprintProposal,
            WeeklyAvailability = application.WeeklyAvailability,
            CommitmentPreference = application.CommitmentPreference,
            CompensationPreferences = string.IsNullOrEmpty(application.CompensationPreferences)
                ? new List<string>()
                : application.CompensationPreferences.Split(Separator, StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries).ToList(),
            PortfolioUrl = application.PortfolioUrl,
            Status = application.Status,
            CreatedAt = application.CreatedAt,
            UpdatedAt = application.UpdatedAt,
            SubmittedAt = application.SubmittedAt,
            ReviewedAt = application.ReviewedAt
        };
    }

    public static string ToStorage(this IEnumerable<string> values)
    {
        return string.Join(Separator, values.Select(v => v.Trim()).Where(v => v.Length > 0));
    }
}