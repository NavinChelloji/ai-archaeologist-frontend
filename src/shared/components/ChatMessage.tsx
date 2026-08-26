import { MarkdownRenderer } from "./MarkdownRenderer";
import styles from "./ChatMessage.module.css";

export interface Citation {
  path: string;
  startLine: number;
  endLine: number;
  symbolName?: string | null;
}

export interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp?: Date;
  loading?: boolean;
  onCitationClick?: (citation: Citation) => void;
}

export function ChatMessage({
  role,
  content,
  citations,
  timestamp,
  loading = false,
  onCitationClick,
}: ChatMessageProps) {
  return (
    <div className={[styles.message, styles[role]].filter(Boolean).join(" ")}>
      <div className={styles.content}>
        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <span>Thinking...</span>
          </div>
        ) : (
          <>
            <div className={styles.text}>
              <MarkdownRenderer content={content} />
            </div>

            {citations && citations.length > 0 && (
              <div className={styles.citations}>
                <div className={styles.citationsLabel}>Citations:</div>
                <div className={styles.citationsList}>
                  {citations.map((citation, idx) => (
                    <button
                      key={`${citation.path}-${citation.startLine}-${idx}`}
                      className={styles.citationChip}
                      onClick={() => onCitationClick?.(citation)}
                      title={`${citation.path}:${citation.startLine}-${citation.endLine}`}
                    >
                      {citation.path}:{citation.startLine}-{citation.endLine}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {timestamp && (
        <div className={styles.timestamp}>
          {timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </div>
      )}
    </div>
  );
}
