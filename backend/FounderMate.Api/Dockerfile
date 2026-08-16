FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Create non-root user and the persistent data directory so that a fresh
# named volume mounted at /app/data is initialized with appuser ownership
# (the app must be able to create its SQLite database there).
RUN adduser --disabled-password --gecos '' appuser \
    && chown -R appuser /app \
    && mkdir -p /app/data \
    && chown appuser:appuser /app/data
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# The Docker build context is the project root (/backend/FounderMate.Api),
# so paths below are relative to this directory.
COPY ["FounderMate.Api.csproj", "."]

# Restore dependencies
RUN dotnet restore "FounderMate.Api.csproj"

# Copy source code
COPY . .

# Build
RUN dotnet build "FounderMate.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FounderMate.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FounderMate.Api.dll"]