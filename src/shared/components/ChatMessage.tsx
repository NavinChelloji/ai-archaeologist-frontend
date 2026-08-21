import { Badge } from "./Badge";
import { MarkdownRenderer } from "./MarkdownRenderer";
import styles from "./ChatMessage.module.css";

export interface Citation {
  fileId: string;
  filePath: string;
  startLine: number;
  endLine: number;
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
                      key={`${citation.fileId}-${idx}`}
                      className={styles.citationChip}
                      onClick={() => onCitationClick?.(citation)}
                      title={`${citation.filePath}:${citation.startLine}-${citation.endLine}`}
                    >
                      {citation.filePath}:{citation.startLine}-{citation.endLine}
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
