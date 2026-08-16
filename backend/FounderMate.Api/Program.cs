using FounderMate.Api.Config;
using FounderMate.Api.Data;
using FounderMate.Api.Helpers;
using FounderMate.Api.Interfaces;
using FounderMate.Api.Middleware;
using FounderMate.Api.Services;
using FounderMate.Api.Validators;
using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;
using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using System.Threading.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Docker-compose maps JWT_SECRET -> Jwt__Secret in the container env, but for
// direct `dotnet run` runs accept the documented JWT_SECRET alias as well.
if (!string.IsNullOrWhiteSpace(builder.Configuration["JWT_SECRET"])
    && string.IsNullOrWhiteSpace(builder.Configuration["Jwt:Secret"]))
{
    builder.Configuration["Jwt:Secret"] = builder.Configuration["JWT_SECRET"];
}

// APP_ORIGIN is the documented deployment variable for the frontend origin.
// Map it to the CORS policy when no Cors__AllowedOrigins__* is provided, so a
// single variable configures CORS on any host (Railway env vars, direct runs).
var corsOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>();
if (!string.IsNullOrWhiteSpace(builder.Configuration["APP_ORIGIN"])
    && corsOrigins is not { Length: > 0 })
{
    builder.Configuration["Cors:AllowedOrigins:0"] = builder.Configuration["APP_ORIGIN"];
}

builder.Services.AddControllers();

builder.Services.AddFluentValidationAutoValidation()
    .AddFluentValidationClientsideAdapters();

builder.Services.AddValidatorsFromAssemblyContaining<Program>();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "FounderMate API",
        Version = "v1",
        Description = "API for FounderMate - A SaaS platform for founders to manage projects, teams, and tasks.",
        Contact = new OpenApiContact
        {
            Name = "FounderMate Team",
            Email = "support@foundermate.com",
            Url = new Uri("https://foundermate.com")
        },
        License = new OpenApiLicense
        {
            Name = "MIT License",
            Url = new Uri("https://opensource.org/licenses/MIT")
        }
    });

    // JWT Bearer auth
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Enter JWT token: Bearer {token}"
    });

    // Group by controller
    options.TagActionsBy(api => new[] { api.GroupName ?? api.ActionDescriptor.RouteValues["controller"] ?? "Other" });
    options.DocInclusionPredicate((_, _) => true);

    // Include XML comments if available
    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    if (File.Exists(xmlPath))
    {
        options.IncludeXmlComments(xmlPath);
    }
});

builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<IJwtService, JwtService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<IFileUploadService, FileUploadService>();
builder.Services.AddScoped<ITeamService, TeamService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<INotificationService, NotificationService>();
builder.Services.AddScoped<IAiService, AiService>();
builder.Services.AddScoped<IApplicationService, ApplicationService>();
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.Configure<FileUploadSettings>(
    builder.Configuration.GetSection(FileUploadSettings.SectionName));

builder.Services.Configure<AiSettings>(
    builder.Configuration.GetSection(AiSettings.SectionName));

builder.Services.Configure<CorsSettings>(
    builder.Configuration.GetSection(CorsSettings.SectionName));

builder.Services.Configure<RateLimitingSettings>(
    builder.Configuration.GetSection(RateLimitingSettings.SectionName));

builder.Services.Configure<EmailSettings>(
    builder.Configuration.GetSection(EmailSettings.SectionName));

var jwtSettings = builder.Configuration.GetSection(JwtSettings.SectionName).Get<JwtSettings>()
    ?? throw new InvalidOperationException("Jwt settings are not configured.");

if (string.IsNullOrWhiteSpace(jwtSettings.Secret) || Encoding.UTF8.GetByteCount(jwtSettings.Secret) < 32)
{
    throw new InvalidOperationException(
        "Jwt:Secret is missing or too short (HMAC-SHA256 requires at least 32 bytes / 256 bits). " +
        "Set the JWT_SECRET environment variable (or Jwt__Secret). Do not commit secrets to source.");
}

builder.Services.Configure<JwtSettings>(
    builder.Configuration.GetSection(JwtSettings.SectionName));

var corsSettings = builder.Configuration.GetSection(CorsSettings.SectionName).Get<CorsSettings>()
    ?? new CorsSettings();

var rateLimitSettings = builder.Configuration.GetSection(RateLimitingSettings.SectionName).Get<RateLimitingSettings>()
    ?? new RateLimitingSettings();

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
                var logger = context.HttpContext.RequestServices.GetRequiredService<ILogger<Program>>();
                logger.LogWarning("JWT authentication failed: {Message}", context.Exception?.Message);
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

builder.Services.AddRateLimiter(options =>
{
    if (rateLimitSettings.Enabled)
    {
        options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
        options.GlobalLimiter = System.Threading.RateLimiting.PartitionedRateLimiter.Create<HttpContext, string>(context =>
            System.Threading.RateLimiting.RateLimitPartition.GetFixedWindowLimiter(
                partitionKey: context.Connection.RemoteIpAddress?.ToString() ?? "unknown",
                factory: _ => new System.Threading.RateLimiting.FixedWindowRateLimiterOptions
                {
                    PermitLimit = rateLimitSettings.PermitLimit,
                    Window = TimeSpan.FromSeconds(rateLimitSettings.WindowSeconds),
                    QueueProcessingOrder = System.Threading.RateLimiting.QueueProcessingOrder.OldestFirst,
                    QueueLimit = rateLimitSettings.QueueLimit
                }));
    }
});

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(corsSettings.AllowedOrigins)
              .AllowAnyHeader()
              .AllowAnyMethod();
        
        if (corsSettings.AllowCredentials)
        {
            policy.AllowCredentials();
        }
    });
});

// When running behind a reverse proxy (nginx), trust forwarded headers from the proxy
// so rate limiting sees the real client IP. Configure via ForwardedHeaders:KnownNetworks.
var forwardedNetworks = builder.Configuration.GetSection("ForwardedHeaders:KnownNetworks").Get<string[]>();
if (forwardedNetworks is { Length: > 0 })
{
    builder.Services.Configure<ForwardedHeadersOptions>(options =>
    {
        options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
        options.ForwardLimit = 2;
        foreach (var network in forwardedNetworks)
        {
            var parts = network.Split('/');
            if (parts.Length == 2
                && IPAddress.TryParse(parts[0], out var address)
                && int.TryParse(parts[1], out var prefixLength)
                && prefixLength is >= 0 and <= 128)
            {
                options.KnownIPNetworks.Add(new System.Net.IPNetwork(address, prefixLength));
            }
        }
    });
}

var app = builder.Build();

app.Services.Migrate();

if (forwardedNetworks is { Length: > 0 })
{
    app.UseForwardedHeaders();
}

app.UseGlobalExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (rateLimitSettings.Enabled)
{
    app.UseRateLimiter();
}

app.UseCors("AllowFrontend");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.MapGet("/", () => Results.Ok(new
{
    status = "healthy",
    environment = app.Environment.EnvironmentName,
    timestamp = DateTime.UtcNow,
})).WithMetadata(new ApiExplorerSettingsAttribute { IgnoreApi = true });

// Lightweight liveness/readiness probe for load balancers and orchestrators.
// Returns 200 once the app is up; no authentication or DB dependency.
app.MapGet("/health", () => Results.Ok(new
{
    status = "healthy",
    timestamp = DateTime.UtcNow,
})).WithMetadata(new ApiExplorerSettingsAttribute { IgnoreApi = true });

app.Run();
