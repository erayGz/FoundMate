# FounderMate

FounderMate is a people-and-project discovery product for finding compatible collaborators, presenting concrete project progress, and testing how well a team works together through a short trial sprint.

## Current status

Working full-stack MVP: a React + TypeScript frontend backed by an ASP.NET Core Web API with a persistent SQLite database. Registration and login use JWT bearer tokens, and the app includes onboarding, project discovery, project creation/editing, structured project applications (apply, review, withdraw), incoming applications, and a member home. Email notifications are currently written to the console only, and the AI endpoints exist but are disabled by default.

## Repository structure

```text
FoundMate/
├── frontend/                    # React (Vite) SPA
├── backend/FounderMate.Api/     # ASP.NET Core Web API
├── backend/FounderMate.Api.Tests/# API tests
├── nginx/                       # Reverse-proxy config used by docker-compose.prod.yml
├── docs/                        # Product and technical documentation
├── docker-compose.yml           # Local/dev Docker stack
├── docker-compose.prod.yml      # Production Docker stack
└── .env.example                 # Required environment variables
```

## Stack

- Frontend: Vite, React 18, TypeScript, Tailwind CSS 4, React Router, Lucide React
- Backend: ASP.NET Core (`.NET 10`), EF Core + SQLite, JWT bearer auth, FluentValidation, rate limiting, CORS, forwarded-headers support for reverse proxies
- Deployment: Docker Compose; nginx reverse proxy; SQLite file in a Docker named volume

## Routes

- `/` - landing page
- `/login`, `/register`
- `/onboarding` - profile setup (auth required)
- `/app` - member home (auth + profile required)
- `/discover` - project discovery (search, roles, categories, working preferences)
- `/projects/new` - create a project
- `/projects/:projectId/edit` - edit a project
- `/projects/:projectId` - project detail
- `/projects/:projectId/apply` - structured application flow
- `/applications` - applications I sent
- `/my-project` - my own project
- `/my-project/applications` - incoming applications (apply/review/withdraw)

## Prerequisites

- Node.js 18 or newer and npm 9 or newer
- .NET 10 SDK (for the backend)
- Docker (optional, for containerized runs)

## Run locally

Frontend (from repository root):

```powershell
cd frontend
npm install
npm run dev   # http://localhost:5173
```

Backend (from repository root):

```powershell
cd backend
$env:JWT_SECRET = "dev-only-secret-that-is-at-least-thirty-two-bytes"
dotnet run --project FounderMate.Api   # http://localhost:5255
```

The API fails fast at startup if `Jwt__Secret` is missing or shorter than 256 bits; never commit a real secret. SQLite will create `foundermate.db` next to the app.

Frontend/API origin defaults are preconfigured: the Vite dev server uses `http://localhost:5173` and the API allows it via CORS. API docs (Swagger) are available in Development at `/swagger`.

## Tests

```powershell
cd backend
dotnet test
```

## Environment variables

Copy `.env.example` to `.env` and fill in the values. `JWT_SECRET` is required for any run (including Docker). `APP_ORIGIN` is required for the production stack only.

## Docker

Dev stack (API on `http://localhost:5000`, SQLite persisted in the `foundermate_data` volume):

```powershell
docker compose up -d
```

Production stack (single exposed HTTP port `80` via nginx; set `JWT_SECRET` and `APP_ORIGIN` in `.env`):

```powershell
docker compose -f docker-compose.prod.yml up -d --build
```

## Deployment

- Recommended architecture: static React build served by the hosting/CDN of your choice → public HTTPS URL → reverse proxy (the bundled nginx container) → ASP.NET API → SQLite in a persistent volume. TLS/HTTPS is terminated by the hosting-layer proxy in front of the nginx container, which listens on plain HTTP internally.
- The frontend is currently developed against the local dev API (`http://localhost:5255`) via `VITE_API_URL`. At deploy time, build it with the deployed API origin, e.g. `VITE_API_URL=https://api.your-domain.com npm run build`, and set the same origin in `APP_ORIGIN` for the API's CORS policy. (Do not hardcode the final deployment URL in source; it is build/runtime configuration.)
- Deploying with Docker: `docker compose -f docker-compose.prod.yml up -d --build`. Everything the API needs comes from environment variables; no code change is required.
- Database: SQLite file at `/app/data/foundermate.db` inside the `foundermate_data` volume. Back up that file (and surrounding `-wal`/`-shm` files) on your normal schedule, e.g.:

```powershell
docker run --rm -v foundermate_data:/data -v ${PWD}:/backup alpine tar czf /backup/foundermate-backup.tgz -C /data .
```

Restore by extracting a backup into the volume before first start.

### Railway (recommended)

The repo carries Railway service configs (`backend/railway.toml` for the API, `frontend/railway.toml` for the frontend) and per-service Dockerfiles. Railway terminates HTTPS and provides the persistent SQLite volume (`/app/data`). Order matters because the frontend bakes the API URL at build time:

1. Install and log in: `npm i -g @railway/cli && railway login`; create a project with `railway init`.
2. **Deploy the API** from `backend/` (`railway up`). On this service set variables:
   - `JWT_SECRET` (generate: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`)
   - `ConnectionStrings__DefaultConnection=Data Source=/app/data/foundermate.db`
   - `APP_ORIGIN=https://<frontend>.up.railway.app` (set after step 4) — or `Cors__AllowedOrigins__0` directly
   - `ASPNETCORE_ENVIRONMENT=Production`
   Health check `/health` confirms the service is up (a fresh volume initializes the SQLite database automatically; migrations run on startup).
3. Get the API's public HTTPS URL (`railway domain`) — this is the deployed API origin.
4. **Deploy the frontend** from `frontend/`: set `VITE_API_URL` to the API URL from step 3 in `frontend/railway.toml` (`buildArgs`), then `railway up`. The Dockerfile fails the build if `VITE_API_URL` is empty.
5. Backfill `APP_ORIGIN` on the API with the frontend URL from step 4, then `railway redeploy`/restart the API.

No code changes are required for deployment; build-time and runtime configuration come from environment variables.

## Planned areas

Messaging, notifications, real email (SendGrid/SMTP), media upload serving, and AI assistance are the next feature areas. The API already has services/endpoints for teams, tasks, notifications, uploads, and AI; the MVP keeps AI and real email disabled by default because they require external keys.