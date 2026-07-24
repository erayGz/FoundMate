export type ApplicationStatus = "draft" | "submitted" | "withdrawn";
export type WeeklyAvailability = "3–5 saat" | "6–8 saat" | "9–12 saat" | "12+ saat";
export type CommitmentPreference = "exploring" | "trial-sprint" | "long-term" | "cofounder-open";
export type CompensationPreference = "volunteer" | "paid" | "equity" | "open-to-discussion";

export interface ApplicationFormValues {
  selectedRole: string;
  motivation: string;
  contribution: string;
  firstSprintProposal: string;
  weeklyAvailability: WeeklyAvailability;
  commitmentPreference: CommitmentPreference;
  compensationPreferences: CompensationPreference[];
  portfolioUrl: string;
}

export interface ProjectApplication extends ApplicationFormValues {
  id: string;
  projectId: string;
  applicantProfileCreatedAt: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  submittedAt: string | null;
}
