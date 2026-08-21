import { lazy, Suspense } from "react";

const MarkdownRendererComponent = lazy(() => import("./MarkdownRenderer").then((m) => ({ default: m.MarkdownRenderer })));

export interface LazyMarkdownRendererProps {
  content: string;
}

export function LazyMarkdownRenderer(props: LazyMarkdownRendererProps) {
  return (
    <Suspense
      fallback={
        <div>
          <p>{props.content.substring(0, 100)}...</p>
        </div>
      }
    >
      <MarkdownRendererComponent {...props} />
    </Suspense>
  );
}
