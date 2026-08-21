import type { RefreshResponse } from "@aca/contracts";
import { toApiError } from "./errors";
import { getAccessToken, setAccessToken } from "./token-store";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

let refreshPromise: Promise<string> | null = null;

/** Shared in-flight promise so concurrent 401s trigger one refresh, not many (REACT_UI_PLAN.md "API Client Strategy"). */
async function refreshAccessToken(): Promise<string> {
  refreshPromise ??= (async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });

    if (!response.ok) {
      setAccessToken(null);
      throw await toApiError(response);
    }

    const body = (await response.json()) as RefreshResponse;
    setAccessToken(body.accessToken);
    return body.accessToken;
  })().finally(() => {
    refreshPromise = null;
  });

  return refreshPromise;
}

export interface ApiFetchOptions extends RequestInit {
  /** The refresh/login endpoints themselves skip the auth header and the 401-retry dance. */
  skipAuth?: boolean;
}

export async function apiFetch<T>(path: string, init: ApiFetchOptions = {}, isRetry = false): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("content-type", "application/json");

  const token = getAccessToken();
  if (!init.skipAuth && token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: "include" });

  if (response.status === 401 && !init.skipAuth && !isRetry) {
    await refreshAccessToken();
    return apiFetch<T>(path, init, true);
  }

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}
