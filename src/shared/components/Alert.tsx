import type { ReactElement, ReactNode } from "react";
import styles from "./Alert.module.css";

export interface AlertProps {
  tone?: "danger" | "info";
  title: string;
  children?: ReactNode;
  /** Shown so a user can quote it in a bug report (API_ERROR_CODES.md: every error carries one). */
  correlationId?: string;
}

export function Alert({ tone = "danger", title, children, correlationId }: AlertProps): ReactElement {
  const classes = [styles.alert, styles[tone]].join(" ");
  return (
    <div className={classes} role="alert">
      <p className={styles.title}>{title}</p>
      {children ? <p className={styles.body}>{children}</p> : null}
      {correlationId ? <p className={styles.correlation}>Reference: {correlationId}</p> : null}
    </div>
  );
}
