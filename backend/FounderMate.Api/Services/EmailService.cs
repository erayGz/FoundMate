using FounderMate.Api.Interfaces;

namespace FounderMate.Api.Services;

public class EmailService : IEmailService
{
    private readonly ILogger<EmailService> _logger;

    public EmailService(ILogger<EmailService> logger)
    {
        _logger = logger;
    }

    public Task SendWelcomeEmailAsync(string email, string name)
    {
        _logger.LogInformation("Welcome email sent to {Email} ({Name}).", email, name);
        return Task.CompletedTask;
    }
}