import type { ReactElement } from "react";
import styles from "./Spinner.module.css";

export interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = "Loading" }: SpinnerProps): ReactElement {
  return (
    <span className={styles.wrapper} role="status" aria-label={label}>
      <span className={styles.ring} />
    </span>
  );
}
