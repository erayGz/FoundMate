import type { CollaborationGoal, FoundmateProfile, ProfileDraft } from "../types/profile";

const PROFILE_KEY = "foundmate.profile.v1";
const DRAFT_KEY = "foundmate.onboardingDraft.v1";
const LEGACY_DRAFT_KEYS = ["foundmate.onboarding-draft.v1"];

function readJson(key: string): unknown {
  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asGoal(value: unknown): CollaborationGoal {
  return value === "project-owner" || value === "contributor" || value === "both" ? value : "both";
}

function normalizeDraft(value: unknown): ProfileDraft | null {
  if (!isRecord(value)) return null;
  return {
    name: asString(value.name),
    headline: asString(value.headline),
    bio: asString(value.bio),
    location: asString(value.location),
    goal: asGoal(value.goal),
    skills: Array.isArray(value.skills) ? value.skills.filter((skill): skill is string => typeof skill === "string") : [],
    availability: asString(value.availability),
  };
}

export function loadProfile() {
  const value = readJson(PROFILE_KEY);
  const draft = normalizeDraft(value);
  if (!draft || !draft.name.trim() || !draft.headline.trim()) return null;
  const completedAt = isRecord(value) ? asString(value.completedAt, new Date(0).toISOString()) : new Date(0).toISOString();
  return { ...draft, completedAt } satisfies FoundmateProfile;
}

export function persistProfile(profile: FoundmateProfile) {
  window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export function clearStoredProfile() {
  window.localStorage.removeItem(PROFILE_KEY);
}

export function loadProfileDraft() {
  const currentDraft = normalizeDraft(readJson(DRAFT_KEY));
  if (currentDraft) return currentDraft;

  for (const legacyKey of LEGACY_DRAFT_KEYS) {
    const legacyDraft = normalizeDraft(readJson(legacyKey));
    if (legacyDraft) {
      persistProfileDraft(legacyDraft);
      window.localStorage.removeItem(legacyKey);
      return legacyDraft;
    }
  }
  return null;
}

export function persistProfileDraft(draft: ProfileDraft) {
  window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export function clearProfileDraft() {
  window.localStorage.removeItem(DRAFT_KEY);
  LEGACY_DRAFT_KEYS.forEach((key) => window.localStorage.removeItem(key));
}
