FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# Create non-root user
RUN adduser --disabled-password --gecos '' appuser && chown -R appuser /app
USER appuser

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy project files
COPY ["FounderMate.Api/FounderMate.Api.csproj", "FounderMate.Api/"]
COPY ["FounderMate.Api.Tests/FounderMate.Api.Tests.csproj", "FounderMate.Api.Tests/"]

# Restore dependencies
RUN dotnet restore "FounderMate.Api/FounderMate.Api.csproj"

# Copy source code
COPY . .

# Build
WORKDIR "/src/FounderMate.Api"
RUN dotnet build "FounderMate.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "FounderMate.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "FounderMate.Api.dll"]