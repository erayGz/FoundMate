import type { Application } from "../../api/applications";
import type { CommitmentPreference, CompensationPreference, ProjectApplication } from "../../types/application";
import { compensationOptions, normalizeWeeklyAvailability } from "./applicationOptions";

const statusMap: Record<string, ProjectApplication["status"]> = {
  Draft: "draft",
  Pending: "submitted",
  Accepted: "accepted",
  Rejected: "rejected",
  Withdrawn: "withdrawn",
};

const commitmentValues = new Set<string>(["exploring", "trial-sprint", "long-term", "cofounder-open"]);
const compensationValues = new Set(compensationOptions.map((option) => option.value));

export function fromBackendApplication(application: Application): ProjectApplication {
  const commitment = application.commitmentPreference && commitmentValues.has(application.commitmentPreference)
    ? application.commitmentPreference as CommitmentPreference
    : "trial-sprint";
  const compensations = ((application.compensationPreferences ?? []) as CompensationPreference[]).filter((item) => compensationValues.has(item));
  const availability = normalizeWeeklyAvailability(application.weeklyAvailability ?? "");

  return {
    id: application.id,
    projectId: application.projectId,
    projectTitle: application.projectTitle,
    applicantId: application.applicantId,
    applicantName: application.applicantName,
    applicantEmail: application.applicantEmail,
    selectedRole: application.selectedRole ?? "",
    motivation: application.motivation ?? "",
    contribution: application.contribution ?? "",
    firstSprintProposal: application.firstSprintProposal ?? "",
    weeklyAvailability: availability,
    commitmentPreference: commitment,
    compensationPreferences: compensations,
    portfolioUrl: application.portfolioUrl ?? "",
    status: statusMap[application.status] ?? "draft",
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    submittedAt: application.submittedAt,
    reviewedAt: application.reviewedAt,
  };
}