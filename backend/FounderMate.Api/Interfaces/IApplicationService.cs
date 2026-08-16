using FounderMate.Api.DTOs.Application;
using FounderMate.Api.DTOs.Common;

namespace FounderMate.Api.Interfaces;

public interface IApplicationService
{
    Task<ApplicationResponseDto> CreateAsync(int applicantId, int projectId, ApplicationUpsertRequestDto request);
    Task<ApplicationResponseDto?> UpdateAsync(int applicantId, int id, ApplicationUpsertRequestDto request);
    Task<ApplicationResponseDto?> GetByIdAsync(int id);
    Task<PaginatedResponse<ApplicationResponseDto>> GetByProjectAsync(int userId, int projectId, int page = 1, int pageSize = 10);
    Task<PaginatedResponse<ApplicationResponseDto>> GetMineAsync(int applicantId, int page = 1, int pageSize = 10);
    Task<ApplicationResponseDto?> UpdateStatusAsync(int ownerId, int id, string status);
    Task<ApplicationResponseDto?> WithdrawAsync(int applicantId, int id);
    Task<bool> DeleteAsync(int applicantId, int id);
}