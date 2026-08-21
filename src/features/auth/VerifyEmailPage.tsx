import { useEffect, useState, type ReactElement } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Alert } from "../../shared/components/Alert";
import { Card } from "../../shared/components/Card";
import { Spinner } from "../../shared/components/Spinner";
import { verifyEmail } from "./auth-api";
import styles from "./AuthLayout.module.css";

type VerifyStatus = "verifying" | "success" | "failed";

export function VerifyEmailPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState<VerifyStatus>(token ? "verifying" : "failed");

  useEffect(() => {
    if (!token) return;

    let cancelled = false;
    void (async () => {
      try {
        await verifyEmail({ token });
        if (!cancelled) setStatus("success");
      } catch {
        if (!cancelled) setStatus("failed");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        {status === "verifying" ? <Spinner label="Verifying your email" /> : null}
        {status === "success" ? (
          <>
            <h1 className={styles.title}>Email verified</h1>
            <p className={styles.subtitle}>Your email is confirmed.</p>
          </>
        ) : null}
        {status === "failed" ? (
          <Alert tone="danger" title="Couldn't verify your email">
            This link is invalid or has expired.
          </Alert>
        ) : null}
        {status !== "verifying" ? (
          <p className={styles.links}>
            <Link to="/">Continue</Link>
          </p>
        ) : null}
      </Card>
    </div>
  );
}
