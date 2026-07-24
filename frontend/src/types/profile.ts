export type CollaborationGoal = "project-owner" | "contributor" | "both";

export interface FoundmateProfile {
  name: string;
  headline: string;
  bio: string;
  location: string;
  goal: CollaborationGoal;
  skills: string[];
  availability: string;
  completedAt: string;
}

export type ProfileDraft = Omit<FoundmateProfile, "completedAt">;
