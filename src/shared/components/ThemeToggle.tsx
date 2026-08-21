import type { ReactElement } from "react";
import { useTheme } from "../hooks/useTheme";
import styles from "./ThemeToggle.module.css";

export function ThemeToggle(): ReactElement {
  const { isDark, setTheme } = useTheme();
  return (
    <button type="button" className={styles.toggle} onClick={() => setTheme(isDark ? "light" : "dark")} title={`Switch to ${isDark ? "light" : "dark"} mode`} aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}>
      <span aria-hidden="true">{isDark ? "\u2600" : "\u263E"}</span>
    </button>
  );
}
