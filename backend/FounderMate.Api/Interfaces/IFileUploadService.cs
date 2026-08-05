namespace FounderMate.Api.Interfaces;

public interface IFileUploadService
{
    Task<string?> UploadAsync(IFormFile file, string subFolder = "");
    Task<bool> DeleteAsync(string fileUrl);
    bool IsValidFile(IFormFile file, out string errorMessage);
}