using FounderMate.Api.Config;
using FounderMate.Api.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class FileUploadService : IFileUploadService
{
    private readonly FileUploadSettings _settings;
    private readonly ILogger<FileUploadService> _logger;
    private readonly string _webRootPath;

    public FileUploadService(IOptions<FileUploadSettings> settings, ILogger<FileUploadService> logger, IWebHostEnvironment env)
    {
        _settings = settings.Value;
        _logger = logger;
        _webRootPath = env.WebRootPath ?? Path.Combine(Directory.GetCurrentDirectory(), "wwwroot");
        EnsureUploadDirectoryExists();
    }

    public async Task<string?> UploadAsync(IFormFile file, string subFolder = "")
    {
        if (!IsValidFile(file, out var error))
        {
            _logger.LogWarning("File validation failed: {Error}", error);
            return null;
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        var fileName = $"{Guid.NewGuid()}{extension}";
        var relativePath = Path.Combine(_settings.UploadPath, subFolder, fileName).Replace("\\", "/");
        var fullPath = Path.Combine(_webRootPath, relativePath);

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        await using var stream = new FileStream(fullPath, FileMode.Create);
        await file.CopyToAsync(stream);

        _logger.LogInformation("File uploaded: {Path}", relativePath);
        return $"{_settings.BaseUrl.TrimEnd('/')}/{relativePath}";
    }

    public Task<bool> DeleteAsync(string fileUrl)
    {
        try
        {
            var uri = new Uri(fileUrl);
            var relativePath = uri.AbsolutePath.TrimStart('/');
            var fullPath = Path.Combine(_webRootPath, relativePath);

            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation("File deleted: {Path}", relativePath);
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to delete file: {Url}", fileUrl);
            return Task.FromResult(false);
        }
    }

    public bool IsValidFile(IFormFile file, out string errorMessage)
    {
        errorMessage = string.Empty;

        if (file == null || file.Length == 0)
        {
            errorMessage = "No file provided.";
            return false;
        }

        if (file.Length > _settings.MaxFileSizeBytes)
        {
            errorMessage = $"File size exceeds maximum allowed ({_settings.MaxFileSizeBytes / (1024 * 1024)}MB).";
            return false;
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_settings.AllowedExtensions.Contains(extension))
        {
            errorMessage = $"File type not allowed. Allowed: {string.Join(", ", _settings.AllowedExtensions)}";
            return false;
        }

        return true;
    }

    private void EnsureUploadDirectoryExists()
    {
        var uploadDir = Path.Combine(_webRootPath, _settings.UploadPath);
        if (!Directory.Exists(uploadDir))
        {
            Directory.CreateDirectory(uploadDir);
        }
    }
}