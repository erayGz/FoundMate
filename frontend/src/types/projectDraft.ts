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

export type ExperienceLevel = "Junior" | "Mid" | "Senior" | "Lead";

export interface RequiredRole {
  id: string;
  title: string;
  responsibility: string;
  experienceLevel: string;
  skills: string[];
}

export interface PublishedProjectDraft extends ProjectDraft {
  roles: RequiredRole[];
  ownerName: string;
  ownerHeadline: string;
  publishedAt: string;
}

export type ApplicationAction = "pending" | "accepted" | "rejected";

export interface IncomingApplication {
  id: string;
  applicantId: string;
  roleTitle: string;
  availability: string;
  skills: string[];
  motivation: string;
  status: ApplicationAction;
}

export interface MockApplicant {
  id: string;
  name: string;
  initials: string;
  color: string;
  skills: string[];
  experience: string;
  portfolioUrl: string;
  availability: string;
  bio: string;
}
