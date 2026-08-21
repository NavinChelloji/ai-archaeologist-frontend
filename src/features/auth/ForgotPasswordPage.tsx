import { useState, type FormEvent, type ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { TextField } from "../../shared/components/TextField";
import { forgotPassword } from "./auth-api";
import styles from "./AuthLayout.module.css";

/**
 * Always shows the same "check your email" confirmation, whether or not the
 * address is registered (AUTH_SERVICE_PLAN.md "Security" — not an
 * account-enumeration oracle).
 */
export function ForgotPasswordPage(): ReactElement {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setSubmitting(true);
    try {
      await forgotPassword({ email });
    } catch {
      // Deliberately ignored — the response is the same either way, see above.
    } finally {
      setSubmitting(false);
      setSent(true);
    }
  }

  if (sent) {
    return (
      <div className={styles.page}>
        <Card className={styles.card}>
          <h1 className={styles.title}>Check your email</h1>
          <p className={styles.subtitle}>
            If an account exists for {email}, we've sent a link to reset your password.
          </p>
          <p className={styles.links}>
            <Link to="/login">Back to sign in</Link>
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <h1 className={styles.title}>Reset your password</h1>
        <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>

        <form className={styles.form} onSubmit={(event) => void handleSubmit(event)}>
          <TextField
            label="Email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Sending…" : "Send reset link"}
          </Button>
        </form>

        <p className={styles.links}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </Card>
    </div>
  );
}
