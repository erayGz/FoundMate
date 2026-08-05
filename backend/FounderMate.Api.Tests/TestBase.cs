using FounderMate.Api.Data;
using FounderMate.Api.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace FounderMate.Api.Tests;

public class TestBase : IDisposable
{
    protected readonly AppDbContext Context;
    protected readonly ServiceProvider ServiceProvider;

    public TestBase()
    {
        var services = new ServiceCollection();
        
        services.AddDbContext<AppDbContext>(options =>
            options.UseInMemoryDatabase(Guid.NewGuid().ToString()));
        
        services.AddLogging();
        
        ServiceProvider = services.BuildServiceProvider();
        Context = ServiceProvider.GetRequiredService<AppDbContext>();
        Context.Database.EnsureCreated();
    }

    public void Dispose()
    {
        Context.Dispose();
        ServiceProvider.Dispose();
    }
    
    protected User CreateTestUser(string email = "test@example.com", string name = "Test User")
    {
        var user = new User
        {
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("Password123!"),
            Name = name,
            Role = "User",
            CreatedAt = DateTime.UtcNow,
            PasswordChangedAt = DateTime.UtcNow
        };
        Context.Users.Add(user);
        Context.SaveChanges();
        return user;
    }
    
    protected Project CreateTestProject(int ownerId, string title = "Test Project")
    {
        var project = new Project
        {
            Title = title,
            Description = "A test project description that is long enough to meet the minimum length requirement.",
            Category = "SaaS",
            OwnerId = ownerId,
            CreatedAt = DateTime.UtcNow
        };
        Context.Projects.Add(project);
        Context.SaveChanges();
        return project;
    }
}