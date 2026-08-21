import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { apiFetch } from "./client";
import { ApiError } from "./errors";
import { setAccessToken } from "./token-store";

function jsonResponse(status: number, body: unknown): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: new Headers(),
    json: async () => body,
  } as Response;
}

beforeEach(() => {
  setAccessToken(null);
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("apiFetch", () => {
  it("returns parsed JSON on success", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(jsonResponse(200, { status: "ok" })));
    await expect(apiFetch("/health/ready")).resolves.toEqual({ status: "ok" });
  });

  it("throws a typed ApiError carrying code and correlationId on failure", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        jsonResponse(404, {
          error: { code: "NOT_FOUND", message: "Not found.", correlationId: "corr-1", retryable: false },
        })
      )
    );

    const error = await apiFetch("/api/v1/auth/me").catch((err: unknown) => err);
    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "NOT_FOUND", correlationId: "corr-1", status: 404 });
  });

  it("refreshes once on 401 and retries the original request", async () => {
    const fetchMock = vi
      .fn()
      // 1. original request -> 401
      .mockResolvedValueOnce(jsonResponse(401, { error: { code: "AUTH_REQUIRED", message: "x", correlationId: "c", retryable: false } }))
      // 2. refresh call -> new access token
      .mockResolvedValueOnce(jsonResponse(200, { accessToken: "new-token", expiresIn: 900 }))
      // 3. retried original request -> success
      .mockResolvedValueOnce(jsonResponse(200, { user: { id: "u1" } }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await apiFetch("/api/v1/auth/me");

    expect(result).toEqual({ user: { id: "u1" } });
    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain("/api/v1/auth/refresh");
    // the retried call carries the newly refreshed token
    const retryHeaders = fetchMock.mock.calls[2][1].headers as Headers;
    expect(retryHeaders.get("authorization")).toBe("Bearer new-token");
  });

  it("shares one in-flight refresh across concurrent 401s", async () => {
    let refreshCalls = 0;
    const fetchMock = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        refreshCalls += 1;
        return jsonResponse(200, { accessToken: "shared-token", expiresIn: 900 });
      }
      // fetch mock always 401s for non-refresh URLs — what matters here is only one refresh call was made
      return jsonResponse(401, { error: { code: "AUTH_REQUIRED", message: "x", correlationId: "c", retryable: false } });
    });
    vi.stubGlobal("fetch", fetchMock);

    // Both calls will hit 401 once, trigger a shared refresh, then 401 again on retry (fetch mock
    // always 401s for non-refresh URLs) — what matters here is only one refresh call was made.
    await Promise.allSettled([apiFetch("/a"), apiFetch("/b")]);

    expect(refreshCalls).toBe(1);
  });
});
