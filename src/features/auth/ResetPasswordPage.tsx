import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../shared/api/errors";
import { Alert } from "../../shared/components/Alert";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { TextField } from "../../shared/components/TextField";
import { resetPassword } from "./auth-api";
import styles from "./AuthLayout.module.css";

const MIN_PASSWORD_LENGTH = 10;

export function ResetPasswordPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (!token) return;
    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await resetPassword({ token, newPassword: password });
      setDone(true);
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <div className={styles.page}>
        <Card className={styles.card}>
          <Alert tone="danger" title="Invalid link">
            This password reset link is missing its token. Request a new one below.
          </Alert>
          <p className={styles.links}>
            <Link to="/forgot-password">Request a new link</Link>
          </p>
        </Card>
      </div>
    );
  }

  if (done) {
    return (
      <div className={styles.page}>
        <Card className={styles.card}>
          <h1 className={styles.title}>Password reset</h1>
          <p className={styles.subtitle}>Your password has been changed. Every existing session was signed out.</p>
          <Button variant="primary" onClick={() => navigate("/login")}>
            Sign in
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Choose a new password</h1>

        {formError ? (
          <Alert tone="danger" title="Couldn't reset your password">
            {formError}
          </Alert>
        ) : null}

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <TextField
            label="New password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
