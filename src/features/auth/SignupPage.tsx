import { useState, type FormEvent, type ReactElement } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ApiError } from "../../shared/api/errors";
import { Alert } from "../../shared/components/Alert";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { TextField } from "../../shared/components/TextField";
import { useAuth } from "./auth-context";
import { consumePostLoginRedirect } from "./post-login-redirect";
import styles from "./AuthLayout.module.css";

const MIN_PASSWORD_LENGTH = 10;

/** adr/0006-email-password-auth.md: email/password as an independent way to create an account, no GitHub required. */
export function SignupPage(): ReactElement {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();

    if (password.length < MIN_PASSWORD_LENGTH) {
      setFormError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    setFormError(null);
    setSubmitting(true);
    try {
      await signup({ email, password });
      navigate(consumePostLoginRedirect(), { replace: true });
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Create Account</h1>
        <p className={styles.subtitle}>Register to get started</p>

        {formError ? (
          <Alert tone="danger" title="Couldn't create your account">
            {formError}
          </Alert>
        ) : null}

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <TextField
            label="Password"
            type="password"
            autoComplete="new-password"
            minLength={MIN_PASSWORD_LENGTH}
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Creating account…" : "Create account"}
          </Button>
        </form>

        <p className={styles.links}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </Card>
    </div>
  );
}
