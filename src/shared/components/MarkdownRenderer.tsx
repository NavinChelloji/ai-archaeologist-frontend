import ReactMarkdown from "react-markdown";
import { SyntaxHighlighter } from "./SyntaxHighlighter";
import styles from "./MarkdownRenderer.module.css";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className={styles.container}>
      <ReactMarkdown
        components={{
          h1: ({ children }: any) => <h1 className={styles.h1}>{children}</h1>,
          h2: ({ children }: any) => <h2 className={styles.h2}>{children}</h2>,
          h3: ({ children }: any) => <h3 className={styles.h3}>{children}</h3>,
          h4: ({ children }: any) => <h4 className={styles.h4}>{children}</h4>,
          p: ({ children }: any) => <p className={styles.p}>{children}</p>,
          ul: ({ children }: any) => <ul className={styles.ul}>{children}</ul>,
          ol: ({ children }: any) => <ol className={styles.ol}>{children}</ol>,
          li: ({ children }: any) => <li className={styles.li}>{children}</li>,
          code: ({ className, children }: any) => {
            const match = /language-(\w+)/.exec(className || "");
            const language: string | null = match?.[1] ?? null;
            const isInline = !className;

            if (isInline) {
              return (
                <code className={styles.inlineCode}>
                  {children}
                </code>
              );
            }

            return (
              <SyntaxHighlighter
                code={String(children).replace(/\n$/, "")}
                language={language}
                showLineNumbers={true}
              />
            );
          },
          pre: ({ children }: any) => <div>{children}</div>,
          blockquote: ({ children }: any) => <blockquote className={styles.blockquote}>{children}</blockquote>,
          a: ({ href, children }: any) => (
            <a href={(href as string) || "#"} className={styles.link} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ),
          table: ({ children }: any) => <table className={styles.table}>{children}</table>,
          thead: ({ children }: any) => <thead className={styles.thead}>{children}</thead>,
          tbody: ({ children }: any) => <tbody className={styles.tbody}>{children}</tbody>,
          tr: ({ children }: any) => <tr className={styles.tr}>{children}</tr>,
          th: ({ children }: any) => <th className={styles.th}>{children}</th>,
          td: ({ children }: any) => <td className={styles.td}>{children}</td>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
