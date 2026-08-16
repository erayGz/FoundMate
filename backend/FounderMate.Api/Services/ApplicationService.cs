using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Application;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class ApplicationService : IApplicationService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ApplicationService> _logger;

    public ApplicationService(AppDbContext context, ILogger<ApplicationService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ApplicationResponseDto> CreateAsync(int applicantId, int projectId, ApplicationUpsertRequestDto request)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project is null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        if (project.OwnerId == applicantId)
        {
            throw new InvalidOperationException("You cannot apply to your own project.");
        }

        var existing = await _context.Applications
            .Include(a => a.Project)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.ProjectId == projectId && a.ApplicantId == applicantId);

        if (existing is not null && existing.Status != "Withdrawn")
        {
            throw new InvalidOperationException("You have already applied to this project.");
        }

        var now = DateTime.UtcNow;
        if (existing is not null)
        {
            existing.SelectedRole = request.SelectedRole;
            existing.Motivation = request.Motivation;
            existing.Contribution = request.Contribution;
            existing.FirstSprintProposal = request.FirstSprintProposal;
            existing.WeeklyAvailability = request.WeeklyAvailability;
            existing.CommitmentPreference = request.CommitmentPreference;
            existing.CompensationPreferences = request.CompensationPreferences.ToStorage();
            existing.PortfolioUrl = request.PortfolioUrl;
            existing.Status = request.Status;
            existing.UpdatedAt = now;
            if (request.Status == "Pending") existing.SubmittedAt ??= now;
            if (request.Status == "Draft") existing.SubmittedAt = null;

            await _context.SaveChangesAsync();
            _logger.LogInformation("Withdrawn Application {ApplicationId} for Project {ProjectId} reopened by User {ApplicantId}", existing.Id, projectId, applicantId);
            return existing.ToDto();
        }

        var application = new Application
        {
            ProjectId = projectId,
            ApplicantId = applicantId,
            SelectedRole = request.SelectedRole,
            Motivation = request.Motivation,
            Contribution = request.Contribution,
            FirstSprintProposal = request.FirstSprintProposal,
            WeeklyAvailability = request.WeeklyAvailability,
            CommitmentPreference = request.CommitmentPreference,
            CompensationPreferences = request.CompensationPreferences.ToStorage(),
            PortfolioUrl = request.PortfolioUrl,
            Status = request.Status,
            SubmittedAt = request.Status == "Pending" ? now : null
        };

        _context.Applications.Add(application);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Application {ApplicationId} created for Project {ProjectId} by User {ApplicantId}", application.Id, projectId, applicantId);

        application.Project = project;
        application.Applicant = (await _context.Users.FindAsync(applicantId))!;

        return application.ToDto();
    }

    public async Task<ApplicationResponseDto?> UpdateAsync(int applicantId, int id, ApplicationUpsertRequestDto request)
    {
        var application = await _context.Applications
            .Include(a => a.Project)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application is null || application.ApplicantId != applicantId)
        {
            return null;
        }

        if (application.Status is "Accepted" or "Rejected")
        {
            throw new InvalidOperationException("A reviewed application can no longer be edited.");
        }

        var wasPending = application.Status == "Pending";
        var now = DateTime.UtcNow;

        application.SelectedRole = request.SelectedRole;
        application.Motivation = request.Motivation;
        application.Contribution = request.Contribution;
        application.FirstSprintProposal = request.FirstSprintProposal;
        application.WeeklyAvailability = request.WeeklyAvailability;
        application.CommitmentPreference = request.CommitmentPreference;
        application.CompensationPreferences = request.CompensationPreferences.ToStorage();
        application.PortfolioUrl = request.PortfolioUrl;
        application.Status = request.Status;
        application.UpdatedAt = now;
        if (request.Status == "Pending" && !wasPending) application.SubmittedAt = now;

        await _context.SaveChangesAsync();
        _logger.LogInformation("Application {ApplicationId} for Project {ProjectId} updated by User {ApplicantId}", id, application.ProjectId, applicantId);

        return application.ToDto();
    }

    public async Task<ApplicationResponseDto?> GetByIdAsync(int id)
    {
        var application = await _context.Applications
            .Include(a => a.Project)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.Id == id);

        return application is null ? null : application.ToDto();
    }

    public async Task<PaginatedResponse<ApplicationResponseDto>> GetByProjectAsync(int userId, int projectId, int page = 1, int pageSize = 10)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project is null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        if (project.OwnerId != userId)
        {
            throw new UnauthorizedAccessException("Only the project owner can view applications.");
        }

        var query = _context.Applications
            .Where(a => a.ProjectId == projectId)
            .Include(a => a.Project)
            .Include(a => a.Applicant);

        var totalCount = await query.CountAsync();
        var applications = await query
            .OrderByDescending(a => a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<ApplicationResponseDto>
        {
            Items = applications.Select(a => a.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<PaginatedResponse<ApplicationResponseDto>> GetMineAsync(int applicantId, int page = 1, int pageSize = 10)
    {
        var query = _context.Applications
            .Where(a => a.ApplicantId == applicantId)
            .Include(a => a.Project)
            .Include(a => a.Applicant);

        var totalCount = await query.CountAsync();
        var applications = await query
            .OrderByDescending(a => a.UpdatedAt ?? a.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<ApplicationResponseDto>
        {
            Items = applications.Select(a => a.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<ApplicationResponseDto?> UpdateStatusAsync(int ownerId, int id, string status)
    {
        var application = await _context.Applications
            .Include(a => a.Project)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application is null || application.Project.OwnerId != ownerId)
        {
            return null;
        }

        if (application.Status != "Pending")
        {
            throw new InvalidOperationException("Only pending applications can be reviewed.");
        }

        var now = DateTime.UtcNow;

        application.Status = status;
        application.ReviewedAt = now;
        application.UpdatedAt = now;

        if (status == "Accepted")
        {
            var alreadyMember = await _context.ProjectMembers
                .AnyAsync(m => m.ProjectId == application.ProjectId && m.UserId == application.ApplicantId);
            if (!alreadyMember)
            {
                _context.ProjectMembers.Add(new ProjectMember
                {
                    ProjectId = application.ProjectId,
                    UserId = application.ApplicantId,
                    JoinedAt = now
                });
            }
        }

        await _context.SaveChangesAsync();

        _logger.LogInformation("Application {ApplicationId} for Project {ProjectId} marked as {Status} by User {OwnerId}", id, application.ProjectId, status, ownerId);

        return application.ToDto();
    }

    public async Task<ApplicationResponseDto?> WithdrawAsync(int applicantId, int id)
    {
        var application = await _context.Applications
            .Include(a => a.Project)
            .Include(a => a.Applicant)
            .FirstOrDefaultAsync(a => a.Id == id);

        if (application is null || application.ApplicantId != applicantId)
        {
            return null;
        }

        if (application.Status is "Accepted" or "Rejected")
        {
            throw new InvalidOperationException("A reviewed application can no longer be withdrawn.");
        }

        application.Status = "Withdrawn";
        application.UpdatedAt = DateTime.UtcNow;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Application {ApplicationId} for Project {ProjectId} withdrawn by User {ApplicantId}", id, application.ProjectId, applicantId);

        return application.ToDto();
    }

    public async Task<bool> DeleteAsync(int applicantId, int id)
    {
        var application = await _context.Applications.FindAsync(id);
        if (application is null || application.ApplicantId != applicantId)
        {
            return false;
        }

        _context.Applications.Remove(application);
        await _context.SaveChangesAsync();
        return true;
    }
}