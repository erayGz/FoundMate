import type { RequiredRole } from "../types/projectDraft";

const ROLES_KEY = "foundmate.requiredRoles.v1";

function createRoleId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `role-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function normalizeRole(raw: Record<string, unknown>): RequiredRole {
  return {
    id: typeof raw.id === "string" ? raw.id : createRoleId(),
    title: typeof raw.title === "string" ? raw.title : "",
    responsibility: typeof raw.responsibility === "string" ? raw.responsibility : "",
    experienceLevel: typeof raw.experienceLevel === "string" ? raw.experienceLevel : (typeof raw.experience === "string" ? raw.experience : "Junior"),
    skills: Array.isArray(raw.skills) ? raw.skills.filter((s): s is string => typeof s === "string") : [],
  };
}

export function loadRequiredRoles(): RequiredRole[] {
  try {
    const raw = window.localStorage.getItem(ROLES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
      .map(normalizeRole);
  } catch {
    return [];
  }
}

export function saveRequiredRoles(roles: RequiredRole[]): void {
  window.localStorage.setItem(ROLES_KEY, JSON.stringify(roles));
}

export function createRequiredRole(title: string, responsibility: string, experienceLevel: string, skills: string[]): RequiredRole {
  return { id: createRoleId(), title, responsibility, experienceLevel, skills };
}
