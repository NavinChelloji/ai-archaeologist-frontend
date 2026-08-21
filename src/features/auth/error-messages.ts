/** Maps AUTH_SERVICE_PLAN.md callback error codes (`?error=CODE`) to human sentences (API_ERROR_CODES.md). */
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  OAUTH_STATE_INVALID: "Your sign-in attempt expired or could not be verified. Please try again.",
  OAUTH_EXCHANGE_FAILED: "GitHub could not complete sign-in. Please try again.",
  GITHUB_ACCESS_DENIED: "GitHub declined access to your account.",
  GITHUB_RECONNECT_REQUIRED: "Your GitHub connection needs to be reconnected.",
  AUTH_REFRESH_INVALID: "Your session is no longer valid. Please sign in again.",
  AUTH_SESSION_REVOKED: "Your session was revoked for security. Please sign in again.",
  AUTH_GITHUB_ALREADY_LINKED: "That GitHub account is already connected to a different account.",
};

export function describeAuthError(code: string | null): string | null {
  if (!code) return null;
  return AUTH_ERROR_MESSAGES[code] ?? "Something went wrong while signing in. Please try again.";
}
