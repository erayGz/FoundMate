import { apiFetch } from "./client";

export interface Project {
  id: number;
  title: string;
  description: string;
  category: string | null;
  ownerId: number;
  createdAt: string;
}

export interface PaginatedProjects {
  items: Project[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface CreateProjectInput {
  title: string;
  description: string;
  category?: string | null;
}

export interface UpdateProjectInput {
  title?: string;
  description?: string;
  category?: string | null;
}

function queryString(params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") query.set(key, String(value));
  }
  const qs = query.toString();
  return qs ? `?${qs}` : "";
}

export function listProjects(params: { search?: string; category?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedProjects> {
  return apiFetch<PaginatedProjects>(`/api/projects${queryString({ search: params.search, category: params.category, page: params.page, pageSize: params.pageSize })}`);
}

export function getMyProjects(params: { search?: string; page?: number; pageSize?: number } = {}): Promise<PaginatedProjects> {
  return apiFetch<PaginatedProjects>(`/api/projects/mine${queryString({ search: params.search, page: params.page, pageSize: params.pageSize })}`);
}

export function getProject(id: number | string): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`);
}

export function createProject(input: CreateProjectInput): Promise<Project> {
  return apiFetch<Project>("/api/projects", { method: "POST", body: input });
}

export function updateProject(id: number | string, input: UpdateProjectInput): Promise<Project> {
  return apiFetch<Project>(`/api/projects/${id}`, { method: "PUT", body: input });
}

export function deleteProject(id: number | string): Promise<void> {
  return apiFetch<void>(`/api/projects/${id}`, { method: "DELETE" });
}