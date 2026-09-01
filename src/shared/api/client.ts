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

/** Auth header + 401-refresh-retry, shared by both the JSON (`apiFetch`) and streaming (`apiFetchStream`) callers — neither parses the body, so the retry dance only needs to live here once. */
async function rawFetch(path: string, init: ApiFetchOptions, isRetry: boolean): Promise<Response> {
  const headers = new Headers(init.headers);
  const token = getAccessToken();
  if (!init.skipAuth && token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...init, headers, credentials: "include" });

  if (response.status === 401 && !init.skipAuth && !isRetry) {
    await refreshAccessToken();
    return rawFetch(path, init, true);
  }

  return response;
}

export async function apiFetch<T>(path: string, init: ApiFetchOptions = {}): Promise<T> {
  const headers = new Headers(init.headers);
  // Only declare a JSON body when one is actually being sent — Fastify treats
  // DELETE/POST/PUT/PATCH as body-carrying methods and tries to JSON-parse
  // whatever the Content-Type header claims, so a bodyless DELETE (or any
  // other bodyless mutation) sent with `content-type: application/json`
  // fails server-side with FST_ERR_CTP_EMPTY_JSON_BODY before it ever
  // reaches the route handler.
  if (init.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  const response = await rawFetch(path, { ...init, headers }, false);

  if (!response.ok) {
    throw await toApiError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

/** For SSE (or any other non-JSON-body) endpoints — same auth/refresh handling as `apiFetch`, but hands back the raw `Response` instead of parsing it. */
export async function apiFetchStream(path: string, init: ApiFetchOptions = {}): Promise<Response> {
  const headers = new Headers(init.headers);
  if (init.body !== undefined) {
    headers.set("content-type", "application/json");
  }

  const response = await rawFetch(path, { ...init, headers }, false);

  if (!response.ok) {
    throw await toApiError(response);
  }

  return response;
}
