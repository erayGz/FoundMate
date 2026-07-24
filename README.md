# Foundmate

Foundmate is a people-and-project discovery product for finding compatible collaborators, presenting concrete project progress, and testing how well a team works together through a short trial sprint.

## Current status

The repository currently contains the approved responsive landing page plus a frontend-only application prototype. The prototype includes browser routing, locally persisted onboarding, an application shell, intent-aware dashboard actions, skill-based recommendations, filtered mock project discovery, project details, structured local project applications, and a first local project-draft form. Authentication, real matching, messaging, AI assistance, persistent server data, and backend APIs are not implemented.

## Repository structure

```text
FoundMate/
├── frontend/  # React landing page and frontend prototype
├── backend/   # Reserved for future backend work
└── docs/      # Product and technical documentation
```

## Frontend stack

The existing export was identified as a Vite application using React 18, TypeScript, Tailwind CSS 4, React Router, and Lucide React icons. npm is the normalized package manager and `package-lock.json` is committed for reproducible installs.

## Prototype routes

- `/` - approved Foundmate landing page
- `/onboarding` - three-step local profile setup
- `/app` - prototype member home
- `/discover` - searchable mock project discovery
- `/projects/new` - local single-draft project creation foundation
- `/projects/:projectId` - project detail and application status
- `/projects/:projectId/apply` - structured application, review, and submitted view
- `/applications` - locally stored applications

The `/app`, `/discover`, `/applications`, and `/projects/new` routes require a locally completed prototype profile. Profile information remains in the current browser's localStorage and is not sent to a server.

Onboarding progress and the completed profile are stored separately:

- `foundmate.onboardingDraft.v1` - incomplete onboarding progress
- `foundmate.profile.v1` - completed profile

The former `foundmate.onboarding-draft.v1` draft key is migrated automatically. Completed users opening `/onboarding` see a completion state; deliberate editing is available at `/onboarding?mode=edit`.

Dashboard primary actions follow the profile's intent (`project-owner`, `contributor`, or `both`). Project-owner and both-intent project creation actions navigate to `/projects/new`. Project recommendations remain based on selected skills. Discovery uses six typed mock projects and supports combined search, role, category, and normalized working-preference filters.

The first project-creation foundation stores one browser-local draft under `foundmate.projectDraft.v1`. The draft currently has four fields only: project name, short description, category, and current stage. Publishing is not implemented, multiple user-created projects are not implemented, and user-created drafts do not appear in Discover.

Project records also contain structured progress, weekly expectations, normalized compensation and working preferences, and fixed trial-sprint tasks. Applications reference projects by ID and are stored separately under `foundmate.applications.v1`. Partial drafts are allowed: `Taslak olarak kaydet` stores the current form values even when submission-required fields are incomplete, shows visible `Taslak kaydedildi.` feedback with a last-saved time, and offers a link to `Başvurularım`. Draft validation is intentionally lighter than submission validation; it checks the project/profile association, supported enum values, safe strings, and optional HTTP/HTTPS portfolio URLs, while final review/submission still requires the complete role, narrative, availability, commitment, compensation, and consent rules.

Drafts survive refresh, submitted applications can be viewed and edited, and withdrawn applications remain visible with their local content under the `Geri çekildi` status. Reopening a withdrawn application restores its previous answers, while starting fresh uses project defaults. Application data is isolated by project ID and the local profile's stable `completedAt` identity, so one project's draft never populates another project's form.

The application flow uses a mobile-safe radio-card control for weekly availability instead of a native select. Application review cards, application list cards, project metadata, portfolio URLs, and long user-entered text use robust wrapping and responsive `min-width: 0` layouts so long unbroken strings stay inside their containers.

Submitting an application in the current prototype does not contact or notify a real project owner.

## Prerequisites

- Node.js 18 or newer
- npm 9 or newer

## Run the frontend

From the repository root:

```powershell
cd frontend
npm install
npm run dev
```

Create a production build with:

```powershell
cd frontend
npm run build
```

Run TypeScript validation separately with:

```powershell
cd frontend
npm run typecheck
```

Run the focused application-flow assertions with:

```powershell
cd frontend
npm run assert:applications
```

The development server prints the local URL, normally `http://localhost:5173`.

## Planned areas

`backend/` is reserved for a future server application; no .NET project has been created. Future product work should define publishing, multiple user-created projects, project editing, incoming applications, authenticated ownership, messaging, notifications, AI support, and backend persistence before those behaviors are implemented.
