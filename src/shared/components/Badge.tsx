import { forwardRef, type HTMLAttributes } from "react";
import styles from "./Badge.module.css";

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
  icon?: React.ReactNode;
}

export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  function Badge(
    {
      variant = "primary",
      size = "md",
      icon,
      children,
      className,
      ...props
    },
    ref
  ) {
    const classes = [
      styles.badge,
      styles[variant],
      styles[size],
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <span ref={ref} className={classes} {...props}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children}
      </span>
    );
  }
);
