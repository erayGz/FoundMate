# FoundMate — Learning Report

## 1. Files Changed

| # | File | Change |
|---|---|---|
| 1 | `src/types/projectDraft.ts` | Added `ExperienceLevel` union type; renamed `experience` → `experienceLevel` in `RequiredRole` |
| 2 | `src/utils/requiredRoleStorage.ts` | Added `normalizeRole()` for backward-compatible loading; updated parameter names |
| 3 | `src/components/app/RoleForm.tsx` | Added minimum-2-skills validation with inline error; added "Lead" to options; controlled component updates |
| 4 | `src/components/app/RequiredRoleCard.tsx` | Updated display from `role.experience` → `role.experienceLevel` |
| 5 | `src/components/app/PublishChecklist.tsx` | Replaced single "En az iki gerekli rol" with 5 granular role-validation items; added `rolesEvery` helper |
| 6 | `src/pages/MyProjectPage.tsx` | Separated `clearProject` and `clearRoles` with proper signatures; fixed TypeScript error; updated parameter names; restored missing `useMemo` import; fixed button styles |

---

## 2. Why Each File Changed

### `types/projectDraft.ts` — Model Improvement

The original `RequiredRole` had `experience: string` — a weak type that allowed any string. Task 2 required a dedicated `experienceLevel` field with exactly 4 allowed values: Junior, Mid, Senior, Lead. By creating a `ExperienceLevel` union type (`"Junior" | "Mid" | "Senior" | "Lead"`), we get compile-time enforcement. Any string outside this set causes a TypeScript error. The field was renamed from `experience` to `experienceLevel` for clarity and to make the breaking change explicit.

### `requiredRoleStorage.ts` — Data Migration

Because we renamed the field, existing localStorage data with the old `experience` key would lose its value on load. The `normalizeRole()` function handles this:
1. If `experienceLevel` exists (new format), use it
2. If only `experience` exists (old format), use that value
3. If neither exists, default to `"Junior"`

This is a **normalisation layer** — it sits between raw JSON and the rest of the app, ensuring every loaded role satisfies the current interface. Without it, old stored data would produce objects missing the `experienceLevel` field, causing silent `undefined` values at runtime.

### `RoleForm.tsx` — Validation + Feature

Task 3 requires each role to have at least 2 skills. Previously `isValid` only checked title and responsibility:
```typescript
const isValid = title.trim().length > 0 && responsibility.trim().length > 0;
```

Now it also checks `skills.length >= 2`. The save button is disabled until all three conditions pass. An inline error message ("En az 2 yetenek seçmelisin.") appears when exactly 1 skill is selected — guidance without being annoying when the user hasn't started yet.

Task 4 required Experience Level to appear between Role Title and Responsibilities. The original form already had this order, so no reordering was needed. "Lead" was added to the options.

### `RequiredRoleCard.tsx` — Mechanical Rename

The card displayed `role.experience`. After the interface rename, it must display `role.experienceLevel`. The visual output is identical.

### `PublishChecklist.tsx` — Granular Blocking Reasons

The old checklist had one item: "En az iki gerekli rol" — a boolean that only checked `roles.length >= 2`. The user saw only "X En az iki gerekli rol" and had no idea *why* it failed. The new checklist replaces it with 5 items:

1. "En az bir rol tanımlanmış" — `roles.length > 0`
2. "Tüm rollerin başlığı dolu" — every role has a non-empty title
3. "Tüm rollerin sorumluluğu dolu" — every role has a non-empty responsibility
4. "Tüm rollerin deneyim seviyesi seçilmiş" — every role has a non-empty `experienceLevel`
5. "Tüm rollerde en az 2 yetenek" — every role has ≥2 skills

If role 2 has only 1 skill, item 5 shows "X". If role 1 has no title, item 2 shows "X". The user instantly sees exactly what to fix. The `rolesEvery` helper was extracted to avoid repeating `roles.length > 0 && roles.every(...)`.

### `MyProjectPage.tsx` — The Biggest Change

This file had the most issues before the fix:

1. **Wrong function signature (Task 7):** `const clear = (roles: RequiredRole[]) => { ... }` — this function accepted `RequiredRole[]` as a parameter but never used it. When passed directly to `onClick`, TypeScript would error: `Type '(roles: RequiredRole[]) => void' is not assignable to type 'MouseEventHandler<HTMLButtonElement>'`. The fix was to remove the parameter entirely: `const clearProject = () => { ... }`.

2. **Missing `clearRoles` function:** The second button (`onClick`) was also calling `clear(roles)` instead of having its own function. Now `clearRoles()` is a separate function that only touches roles state, not draft or published state.

3. **Broken UI state:** Neither button reset `showRoleForm` or `editingRole`. After clearing, stale form state could still show. Both functions now explicitly close the role form.

4. **Wrong button styling:** The "Hepsini sil" button had `bg-[#5448d8]` (primary purple, same as "Rol ekle") and a `Plus` icon — completely wrong for a destructive action. Fixed to `border-[#e8d6d6] bg-white text-[#a52f43] hover:bg-[#fff1f3]` with `Trash2` icon, matching the "Taslağı temizle" button's destructive style.

5. **Missing imports:** `useMemo` was removed but `pendingApplicationCount` depends on it. Both were restored.

6. **Parameter name mismatch:** `addRole` and `updateRole` still used `experience: string` instead of `experienceLevel: string`. Fixed.

---

## 3. React Concepts Used

### `useState`
Every piece of mutable UI state uses `useState`:

- `MyProjectPage`: `draft`, `roles`, `showRoleForm`, `editingRole`, `published`
- `RoleForm`: `title`, `responsibility`, `experienceLevel`, `skills`, `customSkill`

**Why:** `useState` is the simplest primitive for local component state. Each call returns `[value, setter]`. Calling the setter triggers a re-render, which is the only way React knows to update the DOM. For form inputs, every keystroke calls a setter, React re-renders, and the new value appears in the input.

### `useMemo`
```typescript
const pendingApplicationCount = useMemo(
  () => mockIncomingApplications.filter((a) => a.status === "pending").length,
  [],
);
```

**Why:** `useMemo` caches a computed value between renders. Without it, `.filter(...).length` would re-run on every render. With an empty dependency array `[]`, it runs once on mount. This is a minor optimisation — the array is tiny — but it's idiomatic for derived data.

### Lifting State
`MyProjectPage` owns the `roles` array and passes it down:
- To `PublishChecklist` via `roles` prop
- To `RoleForm` via `initialRole` + `onSave`/`onCancel` callbacks
- To `RequiredRoleCard` via `role`, `onEdit`, `onDelete` props

**Why:** Multiple components need to read or modify `roles`. If each had its own copy, they could diverge (one shows 3 roles, another shows 4). By keeping `roles` in their nearest common ancestor (`MyProjectPage`), there is one source of truth. This is called **lifting state up**.

### Callback Props
`RoleForm` declares:
```typescript
interface RoleFormProps {
  initialRole?: RequiredRole;
  onSave: (title: string, responsibility: string, experienceLevel: string, skills: string[]) => void;
  onCancel: () => void;
}
```

`MyProjectPage` passes `addRole` or `updateRole` as `onSave`.

**Why:** In React, data flows down (props) and changes flow up (callbacks). The child component is a pure renderer — it doesn't know about `localStorage` or state management. When the user clicks "Kaydet", it calls `onSave(...)`. The parent decides what that means (add a role, update a role, persist to localStorage). This makes `RoleForm` reusable.

### Controlled Components
Every `<select>`, `<textarea>`, `<input>` has:
```typescript
value={stateVariable}
onChange={(e) => setStateVariable(e.target.value)}
```

**Why:** In a controlled component, React state is the single source of truth for the input's value. The input cannot change independently. This means validation runs on every render using the same state that drives the UI. The save button's `disabled` prop is derived directly from `titleValid && responsibilityValid && skillsValid` — no need to read DOM values.

### Conditional Rendering

Used in `RoleForm`:
```tsx
{!skillsValid && skills.length > 0 && skills.length < 2 && (
  <p className="...">En az 2 yetenek seçmelisin.</p>
)}
```

**Why:** The error only appears in one specific state (exactly 1 skill selected). Conditional rendering keeps the DOM in sync with that state. When `skills.length` becomes 0 or ≥2, the error element is not in the DOM at all — no need for `display: none` or opacity tricks.

Used in `MyProjectPage`:
```tsx
{showRoleForm && <RoleForm .../>}
{roles.length > 0 ? <div>... : !showRoleForm && <div>...}
```

**Why:** Show the form only when adding/editing. Show roles only when they exist. Show empty state only when there are no roles and no form is open. The three states are mutually exclusive, and conditional rendering expresses that naturally.

---

## 4. TypeScript Concepts Used

### `interface`
```typescript
interface RequiredRole {
  id: string;
  title: string;
  responsibility: string;
  experienceLevel: string;
  skills: string[];
}
```

**Why:** Interfaces define the shape of objects. They are the standard way to type props, domain models, and API responses. Unlike classes, they exist only at compile time — zero runtime cost. They also provide excellent IDE autocomplete and refactoring support.

### Union Types
```typescript
export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead";
```

**Why:** Union types restrict a value to a fixed set of literals. Using `string` would allow `"junior"` (wrong case), `"Expert"` (not in the set), or `"abc123"` (nonsense). With the union type, TypeScript catches these at compile time. The IDE also suggests valid values during autocomplete.

The `experienceLevel` field in `RequiredRole` is typed as `string` (not `ExperienceLevel`) because during form editing it can be an empty string `""` (the "Seç" option). Stricter typing would require `ExperienceLevel | ""` or handling the empty state differently. Using `string` is a pragmatic choice here — validation happens at the form level and in the publish checklist.

### `extends`
```typescript
export interface PublishedProjectDraft extends ProjectDraft {
  roles: RequiredRole[];
  ownerName: string;
  ownerHeadline: string;
  publishedAt: string;
}
```

(Not changed in this PR, but used in the codebase.)

**Why:** `extends` creates a derived interface that inherits all properties of the base. A `PublishedProjectDraft` is a `ProjectDraft` with extra fields. TypeScript enforces that anywhere a `ProjectDraft` is expected, a `PublishedProjectDraft` is accepted (substitutability). This avoids duplicating the 15+ fields of `ProjectDraft`.

### Type Predicates (`is`)
```typescript
.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
```

**Why:** `Array.prototype.filter` returns the same type as the input array. Without a type predicate, `parsed.filter(...)` would return `unknown[]`. The `item is Record<string, unknown>` return type tells TypeScript: "if this returns true, treat `item` as `Record<string, unknown>`". This lets us chain `.map(normalizeRole)` without additional casting.

### `Partial`, `Record`, `keyof`, `generics`
Used elsewhere in the codebase but not modified in this PR:
- `Record<ProjectDraftStage, string>` maps each stage enum to a Turkish label
- `Omit<ProjectDraft, "createdAt" | "updatedAt">` creates a type without timestamp fields

---

## 5. Every New Function Explained

### `normalizeRole(raw: Record<string, unknown>): RequiredRole`

**Inputs:** A raw object parsed from `JSON.parse` — could be any shape.

**Outputs:** A fully-typed `RequiredRole` with guaranteed defaults.

**Side effects:** None.

**Purpose:** Defensive parsing for localStorage data. When the data model changes (e.g. `experience` → `experienceLevel`), old stored data becomes invalid. This function bridges the gap:
- `id` → falls back to a new UUID if missing
- `title` / `responsibility` → fall back to `""` if not strings
- `experienceLevel` → reads new key first; falls back to old `experience` key; defaults to `"Junior"`
- `skills` → filters to only string values, defaults to `[]`

This is called a **normalisation layer**. Every role that enters the app goes through it, so downstream code never sees `undefined` or malformed data.

### `rolesEvery(roles: RequiredRole[], predicate: (r: RequiredRole) => boolean): boolean`

**Inputs:** An array of roles and a predicate function.

**Outputs:** `true` if `roles` is non-empty AND every role satisfies the predicate.

**Side effects:** None.

**Purpose:** The publish checklist needs to answer "do all roles meet condition X?" five times. The naive check `roles.every(predicate)` returns `true` for an empty array (vacuous truth). This is wrong — if there are no roles, none of the per-role checks should pass. `rolesEvery` encapsulates the correct logic `roles.length > 0 && roles.every(predicate)`.

### `clearProject(): void`

**Inputs:** None (closures over state setters and storage functions).

**Outputs:** None.

**Side effects:**
1. Shows `window.confirm("Bu proje taslağını temizlemek istediğinden emin misin?")`
2. Calls `clearProjectDraft()` — removes `foundmate.projectDraft.v1` from localStorage
3. Calls `saveRequiredRoles([])` — overwrites `foundmate.requiredRoles.v1` with empty array
4. Sets `draft` → `null`
5. Sets `roles` → `[]`
6. Sets `showRoleForm` → `false`
7. Sets `editingRole` → `null`
8. Sets `published` → `false`

**Purpose:** Complete destructive reset. User confirms, then every piece of project state is wiped. The page re-renders showing the "no draft" empty state.

### `clearRoles(): void`

**Inputs:** None (closures over state setters and storage functions).

**Outputs:** None.

**Side effects:**
1. Shows `window.confirm("Tüm rolleri silmek istediğinden emin misin?")`
2. Calls `saveRequiredRoles([])` — overwrites `foundmate.requiredRoles.v1` with empty array
3. Sets `roles` → `[]`
4. Sets `showRoleForm` → `false`
5. Sets `editingRole` → `null`

**Purpose:** Soft reset — only roles are removed. The project draft, publish state, and all project information remain untouched. After clearing, the publish checklist updates because it derives its state from the `roles` array.

---

## 6. Validation Rules

### RoleForm (prevents saving)

| Rule | Implementation | User Feedback |
|---|---|---|
| Title must be non-empty | `title.trim().length > 0` | Save button disabled |
| Responsibility must be non-empty | `responsibility.trim().length > 0` | Save button disabled |
| At least 2 skills required | `skills.length >= 2` | Save button disabled + inline error "En az 2 yetenek seçmelisin." |
| No duplicate skills (predefined) | `current.includes(skill)` in `toggleSkill` | Skill is toggled off (remove) or silently rejected (add) |
| No duplicate skills (custom) | `!skills.includes(trimmed)` in `addCustomSkill` | Custom skill is silently rejected |

### PublishChecklist (blocks publishing)

| Rule | Implementation | Checklist Label |
|---|---|---|
| Project name ≥ 3 characters | `draft.name.trim().length >= 3` | "Proje adı" |
| Short description ≥ 30 characters | `draft.shortDescription.trim().length >= 30` | "Kısa açıklama" |
| Problem description ≥ 80 characters | `draft.problemDescription.trim().length >= 80` | "Problem açıklaması" |
| Target users ≥ 20 characters | `draft.targetUsers.trim().length >= 20` | "Hedef kullanıcılar" |
| Current solution ≥ 30 characters | `draft.currentSolution.trim().length >= 30` | "Mevcut çözüm açıklaması" |
| Success metric ≥ 15 characters | `draft.successMetric.trim().length >= 15` | "Başarı metriği" |
| First sprint plan ≥ 30 characters | `draft.plannedFirstSprint.trim().length >= 30` | "İlk sprint planı" |
| At least 1 role defined | `roles.length > 0` | "En az bir rol tanımlanmış" |
| Every role has a title | `rolesEvery(roles, r => r.title.trim().length > 0)` | "Tüm rollerin başlığı dolu" |
| Every role has a responsibility | `rolesEvery(roles, r => r.responsibility.trim().length > 0)` | "Tüm rollerin sorumluluğu dolu" |
| Every role has experience level | `rolesEvery(roles, r => r.experienceLevel.length > 0)` | "Tüm rollerin deneyim seviyesi seçilmiş" |
| Every role has ≥2 skills | `rolesEvery(roles, r => r.skills.length >= 2)` | "Tüm rollerde en az 2 yetenek" |
| Project logo | Always `false` | "Proje logosu" |
| Banner image | Always `false` | "Banner görseli" |

---

## 7. Architectural Improvements

### Separation of Concerns

Before the fix, a single `clear` function with `(roles: RequiredRole[]) => void` signature handled *both* destructive buttons. This was wrong in three ways:

1. **Wrong type:** The parameter was unused but made the function incompatible with `onClick`.
2. **Wrong scope:** Both buttons called the same function, so there was no way to clear only roles.
3. **Wrong state:** Neither function cleaned up form editing state.

Now `clearProject` and `clearRoles` each have a single, well-defined responsibility:
- `clearProject` = hard reset (everything goes)
- `clearRoles` = soft reset (only roles go)

### Backward-Compatible Data Migration

By normalising in `requiredRoleStorage.ts` (at the data boundary), every component receives valid data regardless of what's in localStorage. If the model changes again, only `normalizeRole` needs updating — no changes in components. This follows the **defensive programming** principle: trust nothing from external storage.

### Granular Checklist Feedback

The old checklist was a pass/fail for roles. The new checklist answers *why* it fails. This follows **fail-fast with clear diagnostics**: the user sees exactly which roles are problematic (missing title, missing experience level, only 1 skill, etc.) without needing to open each role form individually.

### Derived `isValid` in RoleForm

Instead of a single `isValid` boolean:
```typescript
const titleValid = title.trim().length > 0;
const responsibilityValid = responsibility.trim().length > 0;
const skillsValid = skills.length >= 2;
const isValid = titleValid && responsibilityValid && skillsValid;
```

This makes it trivial to show field-level error messages in the future. Each validation also reads directly from state (no stale closures, no `useRef`).

### Destructive Button Consistency

Both destructive buttons now share the same visual style: `border-[#e8d6d6] bg-white text-[#a52f43] hover:bg-[#fff1f3]` with `Trash2` icon. This visually groups them as dangerous actions, distinct from the primary "Rol ekle" button (purple) and navigation links.

### Restored Missing Features

The original `MyProjectPage` had a `pendingApplicationCount` badge on the "Gelen başvurular" link. This was accidentally dropped in the earlier broken edit. Restoring it is important for UX — the user can see at a glance that there are pending applications.
