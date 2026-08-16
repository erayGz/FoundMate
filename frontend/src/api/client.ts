const DEV_FALLBACK_API_URL = import.meta.env.DEV ? "http://localhost:5255" : "";
const API_URL = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/+$/, "") ?? DEV_FALLBACK_API_URL;

const TOKEN_KEY = "foundmate.auth.token.v1";

export function getStoredToken(): string | null {
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null): void {
  if (token) {
    window.localStorage.setItem(TOKEN_KEY, token);
  } else {
    window.localStorage.removeItem(TOKEN_KEY);
  }
}

export interface ApiErrorBody {
  statusCode?: number;
  message?: string;
  title?: string;
  errors?: Record<string, unknown> | null;
}

export class ApiError extends Error {
  readonly status: number;
  readonly body: ApiErrorBody;

  constructor(status: number, body: ApiErrorBody) {
    super(errorMessageFor(status, body));
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }
}

export function getApiErrorMessage(error: unknown): string {
  return error instanceof ApiError ? error.message : "Bir şeyler ters gitti. Lütfen tekrar dene.";
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) headers["Content-Type"] = "application/json";
  if (options.auth !== false) {
    const token = getStoredToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method ?? "GET",
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, {
      statusCode: 0,
      message: "Sunucuya bağlanılamadı. Lütfen internet bağlantını kontrol edip tekrar dene.",
    });
  }

  if (!response.ok) {
    let body: ApiErrorBody = {};
    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = {};
    }
    throw new ApiError(response.status, body);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

function errorMessageFor(status: number, body: ApiErrorBody): string {
  if (body.message?.trim()) return body.message.trim();

  if (body.errors) {
    const detailParts = Object.entries(body.errors)
      .flatMap(([, value]) => (Array.isArray(value) ? value.map(String) : []))
      .filter(Boolean);
    if (detailParts.length) return detailParts.join(" ");
  }

  if (body.title?.trim()) return body.title.trim();

  return defaultErrorMessage(status);
}

function defaultErrorMessage(status: number): string {
  switch (status) {
    case 0:
      return "Sunucuya bağlanılamadı. Lütfen internet bağlantını kontrol edip tekrar dene.";
    case 400:
      return "Geçersiz istek. Gönderilen bilgileri kontrol et.";
    case 401:
      return "Oturumun geçerli değil. Lütfen tekrar giriş yap.";
    case 403:
      return "Bu işlemi yapmaya yetkin yok.";
    case 404:
      return "Aradığın kaynak bulunamadı.";
    case 409:
      return "Bu kayıt zaten mevcut.";
    case 429:
      return "Çok fazla istek gönderildi. Lütfen biraz bekleyip tekrar dene.";
    default:
      return "Bir şeyler ters gitti. Lütfen tekrar dene.";
  }
}