import { apiFetch } from "./client";

export type BackendApplicationStatus = "Draft" | "Pending" | "Accepted" | "Rejected" | "Withdrawn";

export interface Application {
  id: number;
  projectId: number;
  projectTitle: string;
  applicantId: number;
  applicantName: string;
  applicantEmail: string;
  selectedRole: string | null;
  motivation: string | null;
  contribution: string | null;
  firstSprintProposal: string | null;
  weeklyAvailability: string | null;
  commitmentPreference: string | null;
  compensationPreferences: string[];
  portfolioUrl: string | null;
  status: BackendApplicationStatus;
  createdAt: string;
  updatedAt: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
}

export interface PaginatedApplications {
  items: Application[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ApplicationUpsertInput {
  selectedRole: string | null;
  motivation: string | null;
  contribution: string | null;
  firstSprintProposal: string | null;
  weeklyAvailability: string | null;
  commitmentPreference: string | null;
  compensationPreferences: string[];
  portfolioUrl: string | null;
  status: "Draft" | "Pending";
}

export function createApplication(projectId: number, input: ApplicationUpsertInput): Promise<Application> {
  return apiFetch<Application>(`/api/applications?projectId=${projectId}`, { method: "POST", body: input });
}

export function updateApplication(id: number, input: ApplicationUpsertInput): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}`, { method: "PUT", body: input });
}

export function getProjectApplications(projectId: number, params: { page?: number; pageSize?: number } = {}): Promise<PaginatedApplications> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return apiFetch<PaginatedApplications>(`/api/applications/project/${projectId}${qs ? `?${qs}` : ""}`);
}

export function getMyApplications(params: { page?: number; pageSize?: number } = {}): Promise<PaginatedApplications> {
  const query = new URLSearchParams();
  if (params.page !== undefined) query.set("page", String(params.page));
  if (params.pageSize !== undefined) query.set("pageSize", String(params.pageSize));
  const qs = query.toString();
  return apiFetch<PaginatedApplications>(`/api/applications/mine${qs ? `?${qs}` : ""}`);
}

export function acceptApplication(id: number): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}/accept`, { method: "POST" });
}

export function rejectApplication(id: number): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}/reject`, { method: "POST" });
}

export function withdrawApplication(id: number): Promise<Application> {
  return apiFetch<Application>(`/api/applications/${id}/withdraw`, { method: "POST" });
}

export function deleteApplication(id: number): Promise<void> {
  return apiFetch<void>(`/api/applications/${id}`, { method: "DELETE" });
}