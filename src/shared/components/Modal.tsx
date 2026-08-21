import { forwardRef, type HTMLAttributes, useEffect } from "react";
import styles from "./Modal.module.css";

export interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  closeButton?: boolean;
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  function Modal(
    {
      isOpen,
      onClose,
      title,
      children,
      actions,
      size = "md",
      closeButton = true,
      className,
      ...props
    },
    ref
  ) {
    useEffect(() => {
      if (isOpen) {
        const handleEscape = (e: KeyboardEvent) => {
          if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        document.body.style.overflow = "hidden";
        return () => {
          document.removeEventListener("keydown", handleEscape);
          document.body.style.overflow = "";
        };
      }
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
      <div className={styles.backdrop} onClick={onClose}>
        <div
          ref={ref}
          className={[styles.modal, styles[size], className].filter(Boolean).join(" ")}
          onClick={(e) => e.stopPropagation()}
          {...props}
        >
          {(title || closeButton) && (
            <div className={styles.header}>
              {title && <h2 className={styles.title}>{title}</h2>}
              {closeButton && (
                <button className={styles.closeButton} onClick={onClose} aria-label="Close modal">
                  ✕
                </button>
              )}
            </div>
          )}

          <div className={styles.content}>{children}</div>

          {actions && <div className={styles.actions}>{actions}</div>}
        </div>
      </div>
    );
  }
);
