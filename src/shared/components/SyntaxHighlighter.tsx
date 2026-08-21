import { useEffect, useRef } from "react";
import Prism from "prismjs";
import "prismjs/themes/prism-tomorrow.css";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-python";
import "prismjs/components/prism-java";
import "prismjs/components/prism-sql";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import "prismjs/components/prism-yaml";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import styles from "./SyntaxHighlighter.module.css";

interface SyntaxHighlighterProps {
  code: string;
  language: string | null;
  showLineNumbers?: boolean;
}

export function SyntaxHighlighter({ code, language, showLineNumbers = true }: SyntaxHighlighterProps) {
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (codeRef.current) {
      Prism.highlightElement(codeRef.current);
    }
  }, [code, language]);

  const lang = language ? language.toLowerCase() : "plaintext";
  const lines = code.split("\n");

  return (
    <div className={styles.container}>
      {showLineNumbers ? (
        <table className={styles.codeTable}>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className={styles.codeLine}>
                <td className={styles.lineNumber}>{idx + 1}</td>
                <td className={styles.lineContent}>
                  <pre className={styles.pre}>
                    <code
                      ref={codeRef}
                      className={`language-${lang}`}
                      suppressHydrationWarning
                    >
                      {line || " "}
                    </code>
                  </pre>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <pre className={styles.pre}>
          <code ref={codeRef} className={`language-${lang}`} suppressHydrationWarning>
            {code}
          </code>
        </pre>
      )}
    </div>
  );
}
