/**
 * `/login` -> GitHub -> our API callback -> `/auth/callback` is a full
 * browser round trip through github.com, so React Router's in-memory
 * navigation state (the `state.from` a ProtectedRoute redirect carries)
 * doesn't survive it. Persist the intended destination across that gap
 * ourselves.
 */
const STORAGE_KEY = "aca:post-login-redirect";

export function savePostLoginRedirect(pathname: string): void {
  if (pathname && pathname !== "/login") {
    sessionStorage.setItem(STORAGE_KEY, pathname);
  }
}

export function consumePostLoginRedirect(): string {
  const pathname = sessionStorage.getItem(STORAGE_KEY);
  sessionStorage.removeItem(STORAGE_KEY);
  return pathname ?? "/";
}
