FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

# The .NET 10 aspnet image already provides a non-root 'app' user; create the
# persistent data directory as root, then run as 'app' so a fresh named volume
# mounted at /app/data is initialized with app ownership (the app must be able
# to create its SQLite database there).
USER root
RUN mkdir -p /app/data \
    && chown -R app:app /app/data
USER app

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