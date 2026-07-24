export type ProjectDraftStage = "idea" | "research" | "prototype" | "early-users" | "first-version";

export interface ProjectDraft {
  name: string;
  shortDescription: string;
  problemDescription: string;
  targetUsers: string;
  currentSolution: string;
  insufficientSolutions: string;
  successMetric: string;
  plannedFirstSprint: string;
  category: string;
  stage: ProjectDraftStage;
  createdAt: string;
  updatedAt: string;
}

export type ProjectDraftFormValues = Omit<ProjectDraft, "createdAt" | "updatedAt">;
