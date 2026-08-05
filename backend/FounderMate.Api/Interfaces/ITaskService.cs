using FounderMate.Api.DTOs.Common;
using FounderMate.Api.DTOs.Task;

namespace FounderMate.Api.Interfaces;

public interface ITaskService
{
    Task<TaskResponseDto> CreateAsync(int userId, int projectId, TaskCreateRequestDto request);
    Task<TaskResponseDto?> GetByIdAsync(int id);
    Task<PaginatedResponse<TaskResponseDto>> GetByProjectAsync(int projectId, int page = 1, int pageSize = 10, string? status = null, int? assigneeId = null, int? teamId = null);
    Task<PaginatedResponse<TaskResponseDto>> GetMyTasksAsync(int userId, int page = 1, int pageSize = 10, string? status = null);
    Task<TaskResponseDto?> UpdateAsync(int userId, int id, TaskUpdateRequestDto request);
    Task<bool> DeleteAsync(int userId, int id);
    
    // Task comments
    Task<PaginatedResponse<TaskCommentResponseDto>> GetCommentsAsync(int taskId, int page = 1, int pageSize = 10);
    Task<TaskCommentResponseDto?> AddCommentAsync(int userId, int taskId, TaskCommentCreateRequestDto request);
    Task<TaskCommentResponseDto?> UpdateCommentAsync(int userId, int commentId, TaskCommentUpdateRequestDto request);
    Task<bool> DeleteCommentAsync(int userId, int commentId);
}