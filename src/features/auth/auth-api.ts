import type {
  AuthMeResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshResponse,
  ResetPasswordRequest,
  SessionResponse,
  SignupRequest,
  VerifyEmailRequest,
} from "@aca/contracts";
import { apiFetch } from "../../shared/api/client";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

/** Not a fetch call — a real browser navigation, so the GitHub consent screen replaces the page (REACT_UI_PLAN.md "Sign In"). */
export function githubStartUrl(): string {
  return `${API_BASE_URL}/api/v1/auth/github/start`;
}

/** Also a real navigation — attaches GitHub to the already-signed-in user (AUTH_SERVICE_PLAN.md "GitHub linking vs. sign-in"). */
export function githubLinkStartUrl(): string {
  return `${API_BASE_URL}/api/v1/auth/github/link/start`;
}

export function fetchMe(): Promise<AuthMeResponse> {
  return apiFetch<AuthMeResponse>("/api/v1/auth/me");
}

export function refreshSession(): Promise<RefreshResponse> {
  return apiFetch<RefreshResponse>("/api/v1/auth/refresh", { method: "POST", skipAuth: true });
}

export function logoutSession(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/logout", { method: "POST" });
}

export function signup(body: SignupRequest): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/api/v1/auth/signup", { method: "POST", body: JSON.stringify(body), skipAuth: true });
}

export function login(body: LoginRequest): Promise<SessionResponse> {
  return apiFetch<SessionResponse>("/api/v1/auth/login", { method: "POST", body: JSON.stringify(body), skipAuth: true });
}

export function verifyEmail(body: VerifyEmailRequest): Promise<void> {
  return apiFetch<void>("/api/v1/auth/verify-email", { method: "POST", body: JSON.stringify(body), skipAuth: true });
}

export function resendVerification(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/resend-verification", { method: "POST" });
}

export function forgotPassword(body: ForgotPasswordRequest): Promise<void> {
  return apiFetch<void>("/api/v1/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(body),
    skipAuth: true,
  });
}

export function resetPassword(body: ResetPasswordRequest): Promise<void> {
  return apiFetch<void>("/api/v1/auth/reset-password", { method: "POST", body: JSON.stringify(body), skipAuth: true });
}

export function unlinkGithub(): Promise<void> {
  return apiFetch<void>("/api/v1/auth/github/unlink", { method: "POST" });
}

/** DATA_RETENTION_AND_PRIVACY.md "Account deletion" — repos, chunks, and conversations are queued for deletion; the account itself is gone immediately. */
export function deleteAccount(): Promise<void> {
  return apiFetch<void>("/api/v1/account", { method: "DELETE" });
}
