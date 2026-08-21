import { useEffect, useState, type ReactElement } from "react";
import { useNavigate } from "react-router-dom";
import { Alert } from "../../shared/components/Alert";
import { Card } from "../../shared/components/Card";
import { Spinner } from "../../shared/components/Spinner";
import { useAuth } from "./auth-context";
import { consumePostLoginRedirect } from "./post-login-redirect";
import styles from "./AuthCallbackPage.module.css";

/**
 * Landed here from the API's `GET /api/v1/auth/github/callback` redirect.
 * The refresh cookie is already set; `refetchUser` is what actually
 * establishes the in-memory access token (REACT_UI_PLAN.md "the callback
 * route reads the outcome, refreshes the session, and redirects").
 */
export function AuthCallbackPage(): ReactElement {
  const { refetchUser } = useAuth();
  const navigate = useNavigate();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const ok = await refetchUser();
      if (cancelled) return;

      if (ok) {
        navigate(consumePostLoginRedirect(), { replace: true });
      } else {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (failed) {
    return (
      <div className={styles.page}>
        <Card>
          <Alert tone="danger" title="Sign-in didn't complete">
            We couldn't establish your session. Please try signing in again.
          </Alert>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Spinner label="Finishing sign-in" />
    </div>
  );
}
