import { lazy, Suspense } from "react";
import { Card, LoadingState } from "./index";

const DependencyGraphComponent = lazy(() => import("./DependencyGraph").then((m) => ({ default: m.DependencyGraph })));

export interface LazyDependencyGraphProps {
  nodes: any[];
  edges: any[];
  onNodeClick?: (node: any) => void;
}

export function LazyDependencyGraph(props: LazyDependencyGraphProps) {
  return (
    <Suspense
      fallback={
        <Card>
          <LoadingState message="Loading graph visualization..." />
        </Card>
      }
    >
      <DependencyGraphComponent {...props} />
    </Suspense>
  );
}
