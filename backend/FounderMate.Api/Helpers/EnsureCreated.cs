using FounderMate.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FounderMate.Api.Helpers;

public static class DatabaseInitializer
{
    /// <summary>
    /// Applies pending EF Core migrations at startup so a fresh deployment
    /// gets the same schema (and migration history) as `dotnet ef database update`.
    /// </summary>
    public static void Migrate(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.Migrate();
    }
}
