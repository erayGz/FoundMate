namespace FounderMate.Api.Config;

public class EmailSettings
{
    public const string SectionName = "Email";
    public string Provider { get; set; } = "Console"; // Console, SendGrid, Smtp
    public string FromEmail { get; set; } = "noreply@foundermate.local";
    public string FromName { get; set; } = "FounderMate";
    public string SmtpHost { get; set; } = "localhost";
    public int SmtpPort { get; set; } = 587;
    public string SmtpUser { get; set; } = string.Empty;
    public string SmtpPass { get; set; } = string.Empty;
    public bool EnableSsl { get; set; } = true;
    public string SendGridApiKey { get; set; } = string.Empty;
}