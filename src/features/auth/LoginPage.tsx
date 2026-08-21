import { useEffect, useState, type FormEvent, type ReactElement } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ApiError } from "../../shared/api/errors";
import { Alert } from "../../shared/components/Alert";
import { Button } from "../../shared/components/Button";
import { Card } from "../../shared/components/Card";
import { GithubMark } from "../../shared/components/icons";
import { TextField } from "../../shared/components/TextField";
import { useAuth } from "./auth-context";
import { githubStartUrl } from "./auth-api";
import { describeAuthError } from "./error-messages";
import { consumePostLoginRedirect, savePostLoginRedirect } from "./post-login-redirect";
import styles from "./LoginPage.module.css";

interface LocationState {
  from?: { pathname: string };
}

/** REACT_UI_PLAN.md "Sign In", extended by adr/0006-email-password-auth.md: GitHub or email/password, either works. */
export function LoginPage(): ReactElement {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const redirectError = describeAuthError(searchParams.get("error"));

  useEffect(() => {
    const from = (location.state as LocationState | null)?.from?.pathname;
    if (from) savePostLoginRedirect(from);
  }, [location.state]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      await login({ email, password });
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
        <h1 className={styles.title}>AI Code Archaeologist</h1>
        <p className={styles.subtitle}>Sign in to import a repository and start asking it questions.</p>

        {redirectError ? (
          <Alert tone="danger" title="Couldn't sign you in">
            {redirectError}
          </Alert>
        ) : null}
        {formError ? (
          <Alert tone="danger" title="Couldn't sign you in">
            {formError}
          </Alert>
        ) : null}

        <a className={styles.githubButton} href={githubStartUrl()}>
          <GithubMark />
          Continue with GitHub
        </a>

        <div className={styles.divider}>or</div>

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
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <Button type="submit" variant="primary" disabled={submitting}>
            {submitting ? "Signing in…" : "Sign in"}
          </Button>
        </form>

        <p className={styles.links}>
          <Link to="/forgot-password">Forgot password?</Link>
          <span aria-hidden="true"> · </span>
          <Link to="/signup">Create an account</Link>
        </p>
      </Card>
    </div>
  );
}
