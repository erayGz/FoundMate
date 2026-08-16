using FounderMate.Api.Data;
using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Project;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace FounderMate.Api.Services;

public class ProjectService : IProjectService
{
    private readonly AppDbContext _context;
    private readonly ILogger<ProjectService> _logger;

    public ProjectService(AppDbContext context, ILogger<ProjectService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ProjectResponseDto> CreateAsync(int userId, ProjectCreateRequestDto request)
    {
        var project = new Project
        {
            Title = request.Title,
            Description = request.Description,
            Category = request.Category,
            OwnerId = userId,
        };

        _context.Projects.Add(project);
        await _context.SaveChangesAsync();
        _logger.LogInformation("Project {ProjectId} created by User {UserId}", project.Id, userId);

        return project.ToDto();
    }

    public async Task<ProjectResponseDto?> GetByIdAsync(int id)
    {
        var project = await _context.Projects.FindAsync(id);
        return project?.ToDto();
    }

    public async Task<PaginatedResponse<ProjectResponseDto>> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, string? category = null)
    {
        var query = _context.Projects.AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        if (!string.IsNullOrWhiteSpace(category))
        {
            query = query.Where(p => p.Category != null && p.Category.ToLower() == category.ToLower());
        }

        var totalCount = await query.CountAsync();
        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<ProjectResponseDto>
        {
            Items = projects.Select(p => p.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<PaginatedResponse<ProjectResponseDto>> GetMyProjectsAsync(int userId, int page = 1, int pageSize = 10, string? search = null)
    {
        var query = _context.Projects.Where(p => p.OwnerId == userId);

        if (!string.IsNullOrWhiteSpace(search))
        {
            var term = search.ToLower();
            query = query.Where(p => p.Title.ToLower().Contains(term) || p.Description.ToLower().Contains(term));
        }

        var totalCount = await query.CountAsync();
        var projects = await query
            .OrderByDescending(p => p.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return new PaginatedResponse<ProjectResponseDto>
        {
            Items = projects.Select(p => p.ToDto()).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize),
        };
    }

    public async Task<ProjectResponseDto?> UpdateAsync(int userId, int id, ProjectUpdateRequestDto request)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null || project.OwnerId != userId)
        {
            return null;
        }

        if (request.Title != null) project.Title = request.Title;
        if (request.Description != null) project.Description = request.Description;
        if (request.Category != null) project.Category = request.Category;
        project.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        return project.ToDto();
    }

    public async Task<bool> DeleteAsync(int userId, int id)
    {
        var project = await _context.Projects.FindAsync(id);
        if (project is null || project.OwnerId != userId)
        {
            return false;
        }

        _context.Projects.Remove(project);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<ProjectMemberResponseDto>> GetMembersAsync(int projectId)
    {
        var project = await _context.Projects.FindAsync(projectId);
        if (project is null)
        {
            throw new KeyNotFoundException("Project not found.");
        }

        var members = await _context.ProjectMembers
            .Where(m => m.ProjectId == projectId)
            .Include(m => m.User)
            .OrderBy(m => m.JoinedAt)
            .ThenBy(m => m.User!.Name)
            .ToListAsync();

        return members.Select(m => m.ToMemberDto()).ToList();
    }
}
