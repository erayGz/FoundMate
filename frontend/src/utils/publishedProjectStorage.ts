import type { PublishedProjectDraft } from "../types/projectDraft";

const PUBLISHED_KEY = "foundmate.publishedProject.v1";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown): string {
  return typeof value === "string" ? value : "";
}

export function loadPublishedProject(): PublishedProjectDraft | null {
  try {
    const raw = window.localStorage.getItem(PUBLISHED_KEY);
    if (!raw) return null;
    const value: unknown = JSON.parse(raw);
    if (!isRecord(value)) return null;
    return value as unknown as PublishedProjectDraft;
  } catch {
    return null;
  }
}

export function savePublishedProject(project: PublishedProjectDraft): void {
  window.localStorage.setItem(PUBLISHED_KEY, JSON.stringify(project));
}

export function clearPublishedProject(): void {
  window.localStorage.removeItem(PUBLISHED_KEY);
}

export function hasPublishedProject(): boolean {
  return loadPublishedProject() !== null;
}
