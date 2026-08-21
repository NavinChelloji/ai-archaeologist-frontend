import type { ReactElement } from "react";
import { Button } from "./Button";
import styles from "./ErrorState.module.css";

interface ErrorStateProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  details?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message,
  onRetry,
  details,
}: ErrorStateProps): ReactElement {
  return (
    <div className={styles.container}>
      <div className={styles.icon}>⚠️</div>
      <h3 className={styles.title}>{title}</h3>
      <p className={styles.message}>{message}</p>
      {details && <p className={styles.details}>{details}</p>}
      {onRetry && (
        <Button onClick={onRetry} variant="primary">
          Retry
        </Button>
      )}
    </div>
  );
}
