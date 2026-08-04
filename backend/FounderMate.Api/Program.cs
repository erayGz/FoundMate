using FounderMate.Api.Config;
using FounderMate.Api.Data;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Paste the JWT token here. Example: eyJhbGciOiJIUzI1NiIs...",
    });

    options.AddSecurityRequirement(_ => new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecuritySchemeReference("Bearer"),
            new List<string>()
        },
    });
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt settings are not configured.");
builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtSettings.Issuer,
            ValidAudience = jwtSettings.Audience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSettings.Secret)),
            ClockSkew = TimeSpan.Zero,
        };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT] AUTHC FAIL: {context.Exception?.Message}");
                return Task.CompletedTask;
            },
            OnTokenValidated = async context =>
            {
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                long issuedAt = 0;

                if (context.SecurityToken is JwtSecurityToken jwtToken)
                {
                    if (long.TryParse(jwtToken.Payload["iat"]?.ToString(), out var parsedIat))
                    {
                        issuedAt = parsedIat;
                    }
                    else
                    {
                        logger.LogWarning("JWT missing valid iat claim.");
                        context.Fail("Token is missing a valid issued-at claim.");
                        return;
                    }
                }
                else if (context.SecurityToken is JsonWebToken jsonToken)
                {
                    if (jsonToken.TryGetPayloadValue<long>("iat", out var parsedIat))
                    {
                        issuedAt = parsedIat;
                    }
                    else
                    {
                        logger.LogWarning("JWT missing valid iat claim.");
                        context.Fail("Token is missing a valid issued-at claim.");
                        return;
                    }
                }
                else
                {
                    context.Fail("Unsupported token type.");
                    return;
                }

                var userIdClaim = context.Principal?.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim is null || !int.TryParse(userIdClaim.Value, out var userId))
                {
                    context.Fail("Token is missing a valid user identifier.");
                    return;
                }

                var db = context.HttpContext.RequestServices.GetRequiredService<AppDbContext>();
                var user = await db.Users.FindAsync(userId);

                if (user is null)
                {
                    logger.LogWarning("JWT {UserId} rejected -> user not found.", userId);
                    context.Fail("User not found.");
                    return;
                }

                if (user.PasswordChangedAt.HasValue)
                {
                    var passwordChangedUtc = DateTime.SpecifyKind(user.PasswordChangedAt.Value, DateTimeKind.Utc);
                    var passwordChangedSeconds = new DateTimeOffset(passwordChangedUtc).ToUnixTimeSeconds();

                    if (issuedAt < passwordChangedSeconds)
                    {
                        logger.LogWarning("JWT {UserId} rejected -> issued {Iat}, pwChanged {Pw}", userId, issuedAt, passwordChangedSeconds);
                        context.Fail("Token was issued before the last password change.");
                        return;
                    }
                }

                logger.LogInformation("JWT {UserId} VALID -> issued {Iat}", userId, issuedAt);
            },
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.Services.EnsureCreated();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    status = "healthy",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow,
})).WithMetadata(new ApiExplorerSettingsAttribute { IgnoreApi = true });

app.Run();
