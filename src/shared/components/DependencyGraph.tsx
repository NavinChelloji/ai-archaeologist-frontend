import React, { useCallback, useMemo } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
} from "reactflow";
import "reactflow/dist/style.css";
import styles from "./DependencyGraph.module.css";

export interface GraphNode {
  id: string;
  label: string;
  type?: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

interface DependencyGraphProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onNodeClick?: (node: GraphNode) => void;
}

export function DependencyGraph({ nodes: graphNodes, edges: graphEdges, onNodeClick }: DependencyGraphProps) {
  const rfNodes: Node[] = useMemo(
    () =>
      graphNodes.map((node, idx) => ({
        id: node.id,
        data: { label: node.label },
        position: { x: (idx % 5) * 250, y: Math.floor(idx / 5) * 200 },
        style: {
          background: "#6c63ff",
          color: "#fff",
          padding: "8px 12px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: 600,
          border: "2px solid #5a52d5",
          cursor: "pointer",
        },
      })),
    [graphNodes]
  );

  const rfEdges: Edge[] = useMemo(
    () =>
      graphEdges.map((edge) => ({
        id: `${edge.source}-${edge.target}`,
        source: edge.source,
        target: edge.target,
        markerEnd: { type: MarkerType.ArrowClosed },
        style: { stroke: "#999", strokeWidth: 2 },
      })),
    [graphEdges]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(rfNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(rfEdges);

  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      const graphNode = graphNodes.find((n) => n.id === node.id);
      if (graphNode && onNodeClick) {
        onNodeClick(graphNode);
      }
    },
    [graphNodes, onNodeClick]
  );

  return (
    <div className={styles.container}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        fitView
      >
        <Background color="#aaa" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
