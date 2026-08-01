using FounderMate.Api.Data;
using Microsoft.EntityFrameworkCore;

namespace FounderMate.Api.Helpers;

public static class DatabaseInitializer
{
    public static void EnsureCreated(this IServiceProvider services)
    {
        using var scope = services.CreateScope();
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        dbContext.Database.EnsureCreated();
    }
}
