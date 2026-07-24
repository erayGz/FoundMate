import type { ProjectDraft, ProjectDraftFormValues, ProjectDraftStage } from "../types/projectDraft";

export const PROJECT_DRAFT_KEY = "foundmate.projectDraft.v1";

const stages: ProjectDraftStage[] = ["idea", "research", "prototype", "early-users", "first-version"];

export const emptyProjectDraftValues: ProjectDraftFormValues = {
  name: "",
  shortDescription: "",
  problemDescription: "",
  targetUsers: "",
  currentSolution: "",
  insufficientSolutions: "",
  successMetric: "",
  plannedFirstSprint: "",
  category: "",
  stage: "idea",
};

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

function normalizeStage(value: unknown): ProjectDraftStage {
  return stages.includes(value as ProjectDraftStage) ? value as ProjectDraftStage : "idea";
}

function normalizeDraft(value: unknown): ProjectDraft | null {
  if (!isRecord(value)) return null;
  const epoch = new Date(0).toISOString();
  const createdAt = isoDate(value.createdAt, epoch);
  return {
    name: text(value.name),
    shortDescription: text(value.shortDescription),
    problemDescription: text(value.problemDescription),
    targetUsers: text(value.targetUsers),
    currentSolution: text(value.currentSolution),
    insufficientSolutions: text(value.insufficientSolutions),
    successMetric: text(value.successMetric),
    plannedFirstSprint: text(value.plannedFirstSprint),
    category: text(value.category),
    stage: normalizeStage(value.stage),
    createdAt,
    updatedAt: isoDate(value.updatedAt, createdAt),
  };
}

export function loadProjectDraft() {
  try {
    const raw = window.localStorage.getItem(PROJECT_DRAFT_KEY);
    if (!raw) return null;
    return normalizeDraft(JSON.parse(raw));
  } catch {
    return null;
  }
}

export function saveProjectDraft(values: ProjectDraftFormValues, existingDraft?: ProjectDraft | null) {
  const now = new Date().toISOString();
  const draft: ProjectDraft = {
    ...values,
    name: values.name.trim(),
    shortDescription: values.shortDescription.trim(),
    problemDescription: values.problemDescription.trim(),
    targetUsers: values.targetUsers.trim(),
    currentSolution: values.currentSolution.trim(),
    insufficientSolutions: values.insufficientSolutions.trim(),
    successMetric: values.successMetric.trim(),
    plannedFirstSprint: values.plannedFirstSprint.trim(),
    category: values.category.trim(),
    createdAt: existingDraft?.createdAt && Number.isFinite(Date.parse(existingDraft.createdAt)) ? existingDraft.createdAt : now,
    updatedAt: now,
  };
  window.localStorage.setItem(PROJECT_DRAFT_KEY, JSON.stringify(draft));
  return draft;
}

export function clearProjectDraft() {
  window.localStorage.removeItem(PROJECT_DRAFT_KEY);
}
