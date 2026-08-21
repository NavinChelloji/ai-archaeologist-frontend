import { lazy, Suspense } from "react";
import { Card } from "./index";
import styles from "./SyntaxHighlighter.module.css";

const SyntaxHighlighterComponent = lazy(() => import("./SyntaxHighlighter").then((m) => ({ default: m.SyntaxHighlighter })));

export interface LazySyntaxHighlighterProps {
  code: string;
  language: string | null;
  showLineNumbers?: boolean;
}

export function LazySyntaxHighlighter(props: LazySyntaxHighlighterProps) {
  return (
    <Suspense
      fallback={
        <div className={styles.container}>
          <pre className={styles.pre}>
            <code>{props.code}</code>
          </pre>
        </div>
      }
    >
      <SyntaxHighlighterComponent {...props} />
    </Suspense>
  );
}
