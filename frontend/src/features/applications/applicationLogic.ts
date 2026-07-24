import type { ApplicationFormValues, ProjectApplication } from "../../types/application";
import { trimApplicationValues, validateSubmissionApplication } from "./applicationValidation";

interface UpsertInput {
  storedApplications: ProjectApplication[];
  applicantProfileCreatedAt: string;
  projectId: string;
  values: ApplicationFormValues;
  submit: boolean;
  now: string;
  createId: () => string;
}

export function upsertProjectApplication({ storedApplications, applicantProfileCreatedAt, projectId, values, submit, now, createId }: UpsertInput) {
  if (!projectId.trim()) throw new Error("A valid project ID is required to save an application");
  if (!applicantProfileCreatedAt.trim()) throw new Error("A valid profile association is required to save an application");
  const existing = storedApplications.find((application) => application.applicantProfileCreatedAt === applicantProfileCreatedAt && application.projectId === projectId);
  const willBeSubmitted = submit || existing?.status === "submitted";
  const applicationValues = willBeSubmitted ? trimApplicationValues(values) : values;
  if (willBeSubmitted && Object.keys(validateSubmissionApplication(applicationValues)).length) throw new Error("Submitted applications must pass submission validation");
  const status = willBeSubmitted ? "submitted" : "draft";
  const application: ProjectApplication = {
    ...applicationValues,
    id: existing?.id ?? createId(), projectId, applicantProfileCreatedAt,
    status, createdAt: existing?.createdAt ?? now, updatedAt: now,
    submittedAt: submit ? existing?.submittedAt ?? now : existing?.status === "submitted" ? existing.submittedAt : null,
  };
  const applications = storedApplications.filter((item) => !(item.applicantProfileCreatedAt === applicantProfileCreatedAt && item.projectId === projectId));
  return { application, applications: [...applications, application] };
}

export function withdrawProjectApplication(storedApplications: ProjectApplication[], applicationId: string, now: string) {
  return storedApplications.map((application) => application.id === applicationId ? { ...application, status: "withdrawn" as const, updatedAt: now } : application);
}
