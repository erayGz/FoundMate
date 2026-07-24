# Foundmate frontend flow

This document describes the current frontend-only prototype. No authentication, backend, database, published user-created projects, messaging, real notification, or API integration is implemented.

## Routes

- `/` - approved landing page
- `/onboarding` - new-profile onboarding, or a compact completion state when a profile exists
- `/onboarding?mode=edit` - deliberate completed-profile editing
- `/app` - profile-gated dashboard
- `/discover` - profile-gated project discovery
- `/projects/new` - local single-draft project creation foundation
- `/projects/:projectId` - project detail; readable without a completed profile
- `/projects/:projectId/apply` - local structured application flow
- `/applications` - profile-gated local application list

## Local profile lifecycle

The prototype separates incomplete progress from completed profile data:

- `foundmate.onboardingDraft.v1` stores an unfinished onboarding draft.
- `foundmate.profile.v1` stores the completed profile.

The legacy `foundmate.onboarding-draft.v1` key is read once, normalized, migrated to the current draft key, and removed. Stored values are normalized before use so partial or older data does not crash the UI.

During new-profile onboarding, field changes update only the draft key. Successful completion writes the profile key and clears current and legacy draft keys. Clearing a draft never clears the completed profile.

When a completed user opens standard onboarding, the form is not mounted and the completed profile is not copied into a draft. The page offers `Ana sayfaya dön` and `Profili düzenle`. Edit mode prefills from the completed profile. Saving replaces the completed profile; canceling returns to the app without changing it.

## Dashboard rules

The primary next-step card follows intent:

- `project-owner` prioritizes project draft creation and offers discovery secondarily.
- `contributor` prioritizes project discovery.
- `both` gives project draft creation and discovery equal visual weight.

Project-owner and both-intent project CTAs navigate to `/projects/new`.

Recommendations use a separate rule: a project is recommended when at least one required role matches one of the user's selected skills. Intent does not alter recommendation membership.

## Project draft foundation

`/projects/new` is a small, local-only foundation for project creation. A completed local profile is required. If no completed profile exists, the page shows a profile-required state and links to `/onboarding?returnTo=%2Fprojects%2Fnew`.

The draft is stored under:

`foundmate.projectDraft.v1`

Only one project draft exists in this first version. The four implemented fields are:

1. Project name
2. Short description
3. Category
4. Current stage

The draft model is intentionally separate from the mock project data model. Saving validates the four fields, writes to localStorage, creates `createdAt` on first save, and updates `updatedAt` on every save. Refreshing `/projects/new` restores the saved draft. Clearing the project draft removes only `foundmate.projectDraft.v1` and does not clear the completed profile, onboarding draft, or applications.

Publishing is not implemented. User-created project drafts do not appear in Discover, are not editable through a project workspace, and do not receive incoming applications.

## Mock projects

All mock projects live in `frontend/src/data/projects.ts`:

1. Kapsül
2. Mimarî
3. Rota
4. DevKöşe
5. FormLab
6. Tracekit

Each project has a typed normalized working preference: `remote`, `hybrid`, `local`, or `flexible`. Visible location copy is display-only and is not used as filter logic.

Each project also has a stable URL ID, structured completed/current/next progress, normalized weekly-hour expectations, an explicitly selected compensation model, trial-sprint availability, and a fixed example sprint task. Detail pages resolve only against this centralized source.

## Discovery filters

Discovery supports:

- Free-text search across project content
- Required role
- Category, generated from the mock project data
- Working preference: all, remote, hybrid, or local

All predicates are combined with logical AND. Each filter also works independently. The result count updates from the filtered collection, the empty state is shown when no project matches, and `Filtreleri temizle` resets query and every filter.

Filter state is encoded in the query string (`q`, `role`, `category`, and `work`). Navigating from discovery to a project and then back preserves the current filter state without global state management.

User-created project drafts are not included in discovery results.

## Application integration

Applications are stored at `foundmate.applications.v1` as a typed array. They reference the project ID and local profile creation timestamp instead of duplicating project or profile objects. Dashboard summaries and the `/applications` page read from the same application context. See `docs/APPLICATION_FLOW.md` for field, validation, status, and lifecycle details.

Submitting an application in the current prototype does not contact or notify a real project owner.
