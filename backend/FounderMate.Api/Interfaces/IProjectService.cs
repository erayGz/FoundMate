using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Project;

namespace FounderMate.Api.Interfaces;

public interface IProjectService
{
    Task<ProjectResponseDto> CreateAsync(int userId, ProjectCreateRequestDto request);
    Task<ProjectResponseDto?> GetByIdAsync(int id);
    Task<PaginatedResponse<ProjectResponseDto>> GetAllAsync(int page = 1, int pageSize = 10, string? search = null, string? category = null);
    Task<PaginatedResponse<ProjectResponseDto>> GetMyProjectsAsync(int userId, int page = 1, int pageSize = 10, string? search = null);
    Task<ProjectResponseDto?> UpdateAsync(int userId, int id, ProjectUpdateRequestDto request);
    Task<bool> DeleteAsync(int userId, int id);
    Task<List<ProjectMemberResponseDto>> GetMembersAsync(int projectId);
}
