# Foundmate application flow

The application experience is a frontend-only, local-data prototype. It does not include authentication, a backend, project-owner inboxes, messaging, or notifications.

Submitting an application in the current prototype does not contact or notify a real project owner.

## Project detail route

Every centralized mock project has a stable ID and detail route at `/projects/:projectId`. Unknown IDs render `Proje bulunamadı` and link back to discovery rather than redirecting silently.

Detail pages show:

- Category, name, stage, description, and proof of progress
- Founder identity, commitment, location, and normalized working preference
- Required roles and whether each role matches the saved profile skills
- Completed work, current priority, and next milestone
- Trial-sprint availability and a fixed 7–14 day example task
- Explicit compensation model and working expectations
- Existing application status and context-appropriate actions

A completed profile is required to apply, but not to read a project. The onboarding return destination points back to the originating project or application route.

## Application route and fields

Applications use `/projects/:projectId/apply`. Invalid project IDs show the shared project-not-found state. Without a completed profile, the application form is not mounted and no empty record is saved.

The structured form contains:

1. One required role from the project's required roles
2. Motivation: 60–600 trimmed characters
3. Concrete contribution: 80–800 trimmed characters
4. Editable first sprint proposal: 30–400 trimmed characters, prefilled from project data
5. Supported weekly availability, prefilled from the profile
6. One required commitment preference
7. One or more compensation preferences
8. Optional valid HTTP or HTTPS portfolio URL

Availability below the project's normalized minimum shows a non-blocking warning. Compensation selections include a clear non-agreement notice.

Weekly availability is rendered as an accessible radio-card group rather than a native select. The options preserve the existing typed values and profile preselection, support keyboard selection through real radio inputs, maintain touch-friendly targets, and wrap safely on narrow mobile screens.

## Storage model

Applications are stored as a typed array under:

`foundmate.applications.v1`

Each record contains a stable local ID, `projectId`, the profile's original `completedAt` identity, form values, status, and timestamps. Full project and profile objects are never copied into an application.

Malformed storage is parsed defensively and invalid records are ignored. Application clearing never touches onboarding drafts or `foundmate.profile.v1`. Profile editing preserves the original profile identity so application association remains stable.

The parser accepts valid partial draft records. Draft records are not discarded merely because submission-required fields such as role, motivation, contribution, sprint proposal, commitment, or compensation are incomplete. Submitted records remain strict: a submitted storage record must still satisfy the complete submission validation rules.

## Draft and duplicate behavior

`Taslak olarak kaydet` creates or updates the single application record for that project and local profile. Refresh restores the stored draft. Saving again updates the same stable ID. Context-level upsert logic removes accidental same-profile/project duplicates before persisting.

Draft deletion uses native confirmation. It removes only that draft application.

Draft validation differs from submission validation. Draft saving permits incomplete role, motivation, contribution, sprint proposal, commitment, and compensation fields, while still requiring a valid project/profile association, safe local strings, supported option values when present, and an optional portfolio URL limited to HTTP or HTTPS. The draft-save control has explicit `idle`, `saving`, `saved`, and `error` interaction states. It shows `Kaydediliyor…` while saving, confirms with `Taslak kaydedildi ✓`, announces `Taslak kaydedildi.` through a polite status region, records the actual last-saved time next to the form actions, and reports `Taslak kaydedilemedi. Tekrar dene.` without clearing the form if local persistence fails.

## Review and submission

`Başvuruyu gözden geçir` validates the complete form and persists the current values before showing the review state. Review displays the project, role, narrative fields, sprint proposal, availability, commitment, compensation preferences, and optional portfolio link.

Submission requires confirmation that the project owner may see the shared information. Submission changes status to `submitted`, sets `submittedAt` on first submission, updates `updatedAt`, and persists locally. The success state explicitly says no real notification was sent.

Submission validation is not weakened by draft support. `Başvuruyu gözden geçir` still requires a selected role, motivation between 60 and 600 trimmed characters, contribution between 80 and 800 trimmed characters, sprint proposal between 30 and 400 trimmed characters, weekly availability, commitment, at least one compensation preference, a valid optional HTTP/HTTPS portfolio URL, and final review consent before submission.

## Editing and withdrawal

A submitted application opens in read-only summary mode. The user can edit it; saves and review/submission update the existing record and `updatedAt` without changing its stable ID or creating a duplicate.

Withdrawal requires native confirmation and changes status to `withdrawn`. A withdrawn application can be reopened with its prior values or restarted by removing the withdrawn record and beginning from project defaults.

Withdrawn applications retain their content locally and remain visible in `Başvurularım` with the `Geri çekildi` status. They do not count as submitted. Reopening restores the withdrawn answers for editing; choosing to start fresh uses clean defaults only for that project. The project/profile key is preserved so withdrawn, draft, and submitted records do not leak values into other projects.

## Applications page

`/applications` lists records associated with the current completed profile and supports all, draft, submitted, and withdrawn status filters. Cards show project name, selected role, status text, last updated date, weekly availability, motivation preview, and the appropriate continue/view/reopen action.

The empty state links to discovery and does not show fabricated founder responses.

Application cards use a single-column mobile layout and responsive metadata grids. Long motivation previews are line-clamped intentionally, while role, project name, status, availability, timestamps, and action buttons wrap or fit within the card at narrow widths.

Review summary cards and project/application metadata use `min-width: 0`, full-width containers, and long-word wrapping. Full review text remains visible; long unbroken motivation, contribution, sprint proposal, project descriptions, compensation labels, and portfolio URLs wrap inside their cards instead of creating horizontal page overflow.

## Dashboard and shell integration

The dashboard keeps intent-based primary actions and skill-based project recommendations unchanged. Contributors and dual-intent profiles receive draft/submitted counts and the latest updated application. Project-owner profiles receive a lower-priority summary.

The application shell contains active routes for home, discovery, and applications. `Projem — Yakında` and `Bağlantılar — Yakında` are visibly disabled labels and do not point to fake pages.

## Deferred backend behavior

A future backend task must define authenticated user identity, server persistence, authorization, project-owner delivery, status transitions controlled by project owners, messaging, notifications, audit history, and data migration. None of those behaviors are simulated here.
