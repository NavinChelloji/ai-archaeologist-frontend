import { useEffect, useState, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { githubLinkStartUrl, resendVerification, unlinkGithub } from "../features/auth/auth-api";
import { useAuth } from "../features/auth/auth-context";
import { describeAuthError } from "../features/auth/error-messages";
import { ApiError } from "../shared/api/errors";
import { Alert } from "../shared/components/Alert";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { GithubMark } from "../shared/components/icons";
import styles from "./SettingsPage.module.css";

/** GitHub connect/disconnect for a user who signed up with email/password (adr/0006-email-password-auth.md). */
export function SettingsPage(): ReactElement {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, refetchUser } = useAuth();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);

  const linkedJustNow = searchParams.get("linked") === "github";
  const redirectError = describeAuthError(searchParams.get("error"));

  /* eslint-disable react-hooks/exhaustive-deps --
     Landed here from the GitHub link callback redirect; refetch once to pick
     up the newly-attached identity, then clear the one-shot query params so
     a page refresh doesn't replay them. Deliberately runs once on mount. */
  useEffect(() => {
    if (linkedJustNow) {
      void refetchUser();
    }
    if (linkedJustNow || searchParams.get("error")) {
      setSearchParams({}, { replace: true });
    }
  }, []);
  /* eslint-enable react-hooks/exhaustive-deps */

  async function handleUnlink(): Promise<void> {
    setError(null);
    setMessage(null);
    setBusy(true);
    try {
      await unlinkGithub();
      await refetchUser();
      setMessage("GitHub disconnected.");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleResendVerification(): Promise<void> {
    setError(null);
    setBusy(true);
    try {
      await resendVerification();
      setVerificationSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (!user) {
    // ProtectedRoute guarantees a signed-in user before this route renders.
    return <></>;
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Settings</h1>
        <p className={styles.back}>
          <Link to="/">← Back</Link>
        </p>

        {linkedJustNow ? <Alert tone="info" title="GitHub connected">You can now import your repositories.</Alert> : null}
        {redirectError ? (
          <Alert tone="danger" title="Couldn't connect GitHub">
            {redirectError}
          </Alert>
        ) : null}
        {error ? <Alert tone="danger" title="Something went wrong">{error}</Alert> : null}
        {message ? <Alert tone="info" title={message} /> : null}

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Email</h2>
          <p className={styles.sectionBody}>{user.email ?? "No email on this account"}</p>
          {user.email && !user.emailVerified ? (
            verificationSent ? (
              <p className={styles.sectionBody}>Verification email sent — check your inbox.</p>
            ) : (
              <Button onClick={() => void handleResendVerification()} disabled={busy}>
                Resend verification email
              </Button>
            )
          ) : null}
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>GitHub</h2>
          {user.githubLinked ? (
            <>
              <p className={styles.sectionBody}>Connected as @{user.githubLogin}</p>
              <Button
                variant="danger"
                onClick={() => void handleUnlink()}
                disabled={busy || !user.hasPassword}
                title={!user.hasPassword ? "Set a password first, or you won't be able to sign in." : undefined}
              >
                Disconnect GitHub
              </Button>
              {!user.hasPassword ? (
                <p className={styles.hint}>
                  Set a password before disconnecting GitHub, or you'll lose access to this account.
                </p>
              ) : null}
            </>
          ) : (
            <a className={styles.connectButton} href={githubLinkStartUrl()}>
              <GithubMark />
              Connect GitHub
            </a>
          )}
        </section>
      </Card>
    </div>
  );
}
