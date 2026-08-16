import { apiFetch } from "./client";

export interface ProjectMember {
  userId: number;
  userName: string;
  userHeadline: string | null;
  joinedAt: string;
}

export function getProjectMembers(projectId: number | string): Promise<ProjectMember[]> {
  return apiFetch<ProjectMember[]>(`/api/projects/${projectId}/members`);
}