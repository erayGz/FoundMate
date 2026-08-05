using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Team;

namespace FounderMate.Api.Interfaces;

public interface ITeamService
{
    Task<TeamResponseDto> CreateAsync(int userId, int projectId, TeamCreateRequestDto request);
    Task<TeamResponseDto?> GetByIdAsync(int id);
    Task<PaginatedResponse<TeamResponseDto>> GetByProjectAsync(int projectId, int page = 1, int pageSize = 10);
    Task<TeamResponseDto?> UpdateAsync(int userId, int id, TeamUpdateRequestDto request);
    Task<bool> DeleteAsync(int userId, int id);
    
    // Team members
    Task<PaginatedResponse<TeamMemberResponseDto>> GetMembersAsync(int teamId, int page = 1, int pageSize = 10);
    Task<TeamMemberResponseDto?> AddMemberAsync(int userId, int teamId, AddTeamMemberRequestDto request);
    Task<TeamMemberResponseDto?> UpdateMemberRoleAsync(int userId, int teamId, int memberId, UpdateTeamMemberRoleRequestDto request);
    Task<bool> RemoveMemberAsync(int userId, int teamId, int memberId);
}