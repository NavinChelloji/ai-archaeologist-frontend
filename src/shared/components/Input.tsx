import { forwardRef, useId, type InputHTMLAttributes } from "react";
import styles from "./Input.module.css";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
  errorMessage?: string;
  hint?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  function Input(
    {
      label,
      error = false,
      errorMessage,
      hint,
      icon,
      id,
      className,
      ...props
    },
    ref
  ) {
    const generatedId = useId();
    const inputId = id ?? generatedId;
    const hintId = `${inputId}-hint`;
    const errorId = `${inputId}-error`;

    return (
      <div className={styles.field}>
        {label && (
          <label className={styles.label} htmlFor={inputId}>
            {label}
            {props.required && <span className={styles.required}>*</span>}
          </label>
        )}

        <div className={styles.inputWrapper}>
          {icon && <span className={styles.icon}>{icon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={[styles.input, error && styles.error, icon && styles.withIcon, className]
              .filter(Boolean)
              .join(" ")}
            aria-invalid={error}
            aria-describedby={hint ? hintId : error ? errorId : undefined}
            {...props}
          />
        </div>

        {errorMessage && (
          <div className={styles.error_message} id={errorId} role="alert">
            {errorMessage}
          </div>
        )}

        {hint && !errorMessage && (
          <div className={styles.hint} id={hintId}>
            {hint}
          </div>
        )}
      </div>
    );
  }
);
