/**
 * The access token lives in memory only — never localStorage, never a
 * cookie the JS can read (REACT_UI_PLAN.md "Security"). The refresh token
 * lives in an HttpOnly cookie the browser handles automatically.
 */
let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string | null): void {
  accessToken = token;
}
