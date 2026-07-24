# Project creation learning notes

This note explains the first small project-creation foundation in plain language. It is still frontend-only. It saves one local draft in this browser and does not publish anything.

## How `/projects/new` is connected to React Router

The route is registered in `frontend/src/App.tsx`.

`/projects/new` is inside the existing `AppShell`, so it gets the same application sidebar, mobile header, background, and page spacing as the dashboard and discovery pages.

The route is placed before `/projects/:projectId` so the word `new` is treated as the draft page, not as a mock project ID.

## How the dashboard button navigates to the route

The dashboard card lives in `frontend/src/pages/AppHomePage.tsx`.

For `project-owner` and `both` profiles, the project creation button is now a React Router `<Link>` pointing to `/projects/new`.

Contributor profiles do not see that as the primary dashboard action, but they can still open `/projects/new` directly. The page explains that project creation is intended for people who want to build or lead a project.

## How React state controls the form fields

The form page is `frontend/src/pages/CreateProjectPage.tsx`.

It keeps the current input values in one React state object:

```ts
ProjectDraftFormValues
```

That object has four fields:

- `name`
- `shortDescription`
- `category`
- `stage`

Whenever the state changes, React re-renders the form with the latest values.

## How `onChange` updates state

Each input calls the small `update` helper:

```ts
update("name", event.target.value)
```

The helper copies the previous form state and replaces just one field. This keeps the form predictable and avoids a separate `useState` call for every field.

## How the `ProjectDraft` TypeScript interface is used

The draft type lives in `frontend/src/types/projectDraft.ts`.

`ProjectDraftFormValues` describes the fields the user edits. `ProjectDraft` adds storage metadata:

- `createdAt`
- `updatedAt`

This keeps the form model small while still letting storage know when the draft was first created and last saved.

## How localStorage save and restore work

The storage helper lives in `frontend/src/utils/projectDraftStorage.ts`.

It uses this key:

```text
foundmate.projectDraft.v1
```

When `/projects/new` opens, it calls `loadProjectDraft()` and uses the saved values if a valid draft exists.

When the user clicks `Taslağı kaydet`, the page validates the four fields and then calls `saveProjectDraft()`. Refreshing the page restores the last saved draft.

`clearProjectDraft()` removes only `foundmate.projectDraft.v1`. It does not touch the completed profile, onboarding draft, or applications.

## Why `createdAt` and `updatedAt` are different

`createdAt` records when the draft was first saved.

`updatedAt` changes every time the user saves again.

That means repeated saves update the same single draft while still preserving when the draft originally started.

## How form validation works

Validation is handled inside `CreateProjectPage.tsx`.

Before saving, the page checks:

- Project name is 3-60 trimmed characters.
- Short description is 30-180 trimmed characters.
- Category is selected.
- Stage is one of the supported stage values.

If validation fails, field errors are shown and focus moves to the error summary.

## How save-feedback state works

The page uses a small save state:

- `idle`
- `saving`
- `saved`
- `error`

While saving, the button says `Kaydediliyor…`.

After a successful save, it says `Taslak kaydedildi ✓` and shows the last saved time.

If localStorage throws an error, the page shows `Taslak kaydedilemedi. Tekrar dene.` and keeps the form values on screen.

## Which files to edit to add the next field

To add one more project field manually, start with these files:

- `frontend/src/types/projectDraft.ts`: add the new field to the type.
- `frontend/src/utils/projectDraftStorage.ts`: normalize and save the new field.
- `frontend/src/pages/CreateProjectPage.tsx`: add the input, validation, and UI copy.
- `docs/FRONTEND_FLOW.md`: document the new field if it changes the prototype flow.

## Next fields to implement manually

- Detailed problem description
- Proposed solution
- Proof of progress
- Required roles
- Role responsibilities
- Weekly commitment
- Working preference
- Compensation model
- Trial sprint task

Do not implement publishing until the full project-owner workspace and backend rules are intentionally designed.
