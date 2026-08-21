import { apiFetch } from "./client";

export interface GraphNode {
  id: string;
  label: string;
  type: string;
}

export interface GraphEdge {
  source: string;
  target: string;
  weight?: number;
}

export interface GraphResponse<T = GraphNode> {
  nodes: T[];
  edges: GraphEdge[];
}

export function getDependencyGraph(repoId: string): Promise<GraphResponse> {
  return apiFetch<GraphResponse>(`/api/v1/repositories/${repoId}/graph/dependencies`);
}

export function getSymbolGraph(repoId: string, fileId?: string): Promise<GraphResponse> {
  const params = new URLSearchParams({ ...(fileId && { fileId }) });
  return apiFetch<GraphResponse>(`/api/v1/repositories/${repoId}/graph/symbols?${params}`);
}

export function getFolderGraph(repoId: string): Promise<GraphResponse> {
  return apiFetch<GraphResponse>(`/api/v1/repositories/${repoId}/graph/folders`);
}
