namespace FounderMate.Api.Config;

public class FileUploadSettings
{
    public const string SectionName = "FileUpload";
    public long MaxFileSizeBytes { get; set; } = 5 * 1024 * 1024; // 5MB
    public string[] AllowedExtensions { get; set; } = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
    public string UploadPath { get; set; } = "uploads";
    public string BaseUrl { get; set; } = string.Empty;
}