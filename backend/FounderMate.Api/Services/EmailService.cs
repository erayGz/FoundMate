using FounderMate.Api.Config;
using FounderMate.Api.Interfaces;
using Microsoft.Extensions.Options;
using Microsoft.Extensions.Logging;

namespace FounderMate.Api.Services;

public class EmailService : IEmailService
{
    private readonly EmailSettings _settings;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IOptions<EmailSettings> settings, ILogger<EmailService> logger)
    {
        _settings = settings.Value;
        _logger = logger;
    }

    public Task SendWelcomeEmailAsync(string email, string name)
    {
        _logger.LogInformation("[{Provider}] Welcome email sent to {Email} ({Name}) from {FromEmail}",
            _settings.Provider, email, name, _settings.FromEmail);
        
        if (_settings.Provider == "Console")
        {
            Console.WriteLine($"=== EMAIL ===");
            Console.WriteLine($"To: {email}");
            Console.WriteLine($"Subject: Welcome to FounderMate!");
            Console.WriteLine($"Body: Hi {name}, welcome to FounderMate!");
            Console.WriteLine($"=============");
        }
        
        return Task.CompletedTask;
    }
}