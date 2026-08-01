namespace FounderMate.Api.Interfaces;

public interface IEmailService
{
    Task SendWelcomeEmailAsync(string email, string name);
}