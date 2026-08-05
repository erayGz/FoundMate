namespace FounderMate.Api.Config;

public class CorsSettings
{
    public const string SectionName = "Cors";
    public string[] AllowedOrigins { get; set; } = ["http://localhost:5173"];
    public string[] AllowedMethods { get; set; } = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"];
    public string[] AllowedHeaders { get; set; } = ["*"];
    public bool AllowCredentials { get; set; } = true;
}