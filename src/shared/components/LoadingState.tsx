import type { ReactElement } from "react";
import { Spinner } from "./Spinner";
import styles from "./LoadingState.module.css";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps): ReactElement {
  return (
    <div className={styles.container}>
      <Spinner />
      <p className={styles.message}>{message}</p>
    </div>
  );
}
