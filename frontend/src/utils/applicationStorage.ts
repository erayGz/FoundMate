import type { ApplicationStatus, CommitmentPreference, CompensationPreference, ProjectApplication, WeeklyAvailability } from "../types/application";
import { weeklyAvailabilityOptions } from "../features/applications/applicationOptions";
import { validateSubmissionApplication } from "../features/applications/applicationValidation";

export const APPLICATIONS_KEY = "foundmate.applications.v1";

const statuses: ApplicationStatus[] = ["draft", "submitted", "withdrawn"];
const commitments: CommitmentPreference[] = ["exploring", "trial-sprint", "long-term", "cofounder-open"];
const compensations: CompensationPreference[] = ["volunteer", "paid", "equity", "open-to-discussion"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function text(value: unknown) {
  return typeof value === "string" ? value : "";
}

function isoDate(value: unknown, fallback: string) {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : fallback;
}

function nullableIsoDate(value: unknown) {
  const candidate = text(value);
  return candidate && Number.isFinite(Date.parse(candidate)) ? candidate : null;
}

function safePortfolioUrl(value: unknown) {
  const candidate = text(value).trim();
  if (!candidate) return "";
  try {
    const url = new URL(candidate);
    return url.protocol === "http:" || url.protocol === "https:" ? candidate : "";
  } catch {
    return "";
  }
}

function normalizeApplication(value: unknown): ProjectApplication | null {
  if (!isRecord(value)) return null;
  const id = text(value.id);
  const projectId = text(value.projectId);
  const applicantProfileCreatedAt = text(value.applicantProfileCreatedAt);
  if (!id || !projectId || !applicantProfileCreatedAt) return null;

  const status = statuses.includes(value.status as ApplicationStatus) ? value.status as ApplicationStatus : "draft";
  const hasValidWeeklyAvailability = weeklyAvailabilityOptions.includes(value.weeklyAvailability as WeeklyAvailability);
  const hasValidCommitmentPreference = commitments.includes(value.commitmentPreference as CommitmentPreference);
  const rawCompensationPreferences = Array.isArray(value.compensationPreferences) ? value.compensationPreferences : [];
  const hasOnlyValidCompensationPreferences = rawCompensationPreferences.every((item) => compensations.includes(item as CompensationPreference));
  const weeklyAvailability = hasValidWeeklyAvailability ? value.weeklyAvailability as WeeklyAvailability : weeklyAvailabilityOptions[1];
  const commitmentPreference = hasValidCommitmentPreference ? value.commitmentPreference as CommitmentPreference : "trial-sprint";
  const compensationPreferences = rawCompensationPreferences.filter((item): item is CompensationPreference => compensations.includes(item as CompensationPreference));

  const epoch = new Date(0).toISOString();
  const createdAt = isoDate(value.createdAt, epoch);
  const normalized: ProjectApplication = {
    id,
    projectId,
    applicantProfileCreatedAt,
    selectedRole: text(value.selectedRole),
    motivation: text(value.motivation),
    contribution: text(value.contribution),
    firstSprintProposal: text(value.firstSprintProposal),
    weeklyAvailability,
    commitmentPreference,
    compensationPreferences,
    portfolioUrl: safePortfolioUrl(value.portfolioUrl),
    status,
    createdAt,
    updatedAt: isoDate(value.updatedAt, createdAt),
    submittedAt: nullableIsoDate(value.submittedAt),
  };

  if (status === "submitted" && (
    !hasValidWeeklyAvailability
    || !hasValidCommitmentPreference
    || !hasOnlyValidCompensationPreferences
    || Object.keys(validateSubmissionApplication(normalized)).length
  )) return null;

  return normalized;
}

export function loadApplications(): ProjectApplication[] {
  try {
    const raw = window.localStorage.getItem(APPLICATIONS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    const deduplicated = new Map<string, ProjectApplication>();
    for (const application of parsed.map(normalizeApplication).filter((item): item is ProjectApplication => Boolean(item))) {
      const key = `${application.applicantProfileCreatedAt}\u0000${application.projectId}`;
      const current = deduplicated.get(key);
      if (!current || application.updatedAt >= current.updatedAt) deduplicated.set(key, application);
    }
    return [...deduplicated.values()];
  } catch {
    return [];
  }
}

export function persistApplications(applications: ProjectApplication[]) {
  window.localStorage.setItem(APPLICATIONS_KEY, JSON.stringify(applications));
}

export function createApplicationId() {
  return globalThis.crypto?.randomUUID?.() ?? `application-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
