import { apiFetch } from "./client";

export interface AuthUser {
  id: number;
  email: string;
  name: string;
  headline: string | null;
  createdAt: string;
  passwordChangedAt: string | null;
}

export interface AuthResponse {
  token: string;
  expiresAt: string;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export function login(payload: LoginRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/users/login", { method: "POST", body: payload });
}

export function register(payload: RegisterRequest): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/api/users/register", { method: "POST", body: payload });
}

export function getCurrentUser(): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/users/me");
}

export interface UpdateProfileInput {
  name?: string;
  headline?: string | null;
}

export function updateCurrentUser(input: UpdateProfileInput): Promise<AuthUser> {
  return apiFetch<AuthUser>("/api/users/me", { method: "PATCH", body: input });
}