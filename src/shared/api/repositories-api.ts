import type {
  DeleteRepositoryResponse,
  GithubRepositoriesResponse,
  ImportRepositoryRequest,
  ImportRepositoryResponse,
  ProcessingJobDto,
  RepositoriesListResponse,
  TreeNodeDto,
  TreeResponse,
} from "@aca/contracts";
import { apiFetch } from "./client";

export interface LanguageBreakdown {
  name: string;
  percentage: number;
  color?: string;
}

export interface RepositoryStats {
  totalFiles: number;
  lineOfCode: number;
  skippedFiles: number;
}

export interface RepositoryOverviewResponse {
  id: string;
  name: string;
  description: string | null;
  url: string;
  language: string | null;
  stats: RepositoryStats;
  languages: LanguageBreakdown[];
}

export interface FileNode {
  id: string;
  name: string;
  type: "file" | "folder";
  size?: number;
  language?: string;
  children?: FileNode[];
}

export interface FileTreeResponse {
  nodes: FileNode[];
  totalFiles: number;
}

export function getRepository(repoId: string): Promise<RepositoryOverviewResponse> {
  return apiFetch<RepositoryOverviewResponse>(`/api/v1/repositories/${repoId}`);
}

/** Live GitHub listing (DEVELOPMENT_STAGES.md Stage 3) — never persisted, so it's re-fetched on every call. */
export function listGithubRepositories(params: {
  page?: number;
  perPage?: number;
  search?: string;
}): Promise<GithubRepositoriesResponse> {
  const query = new URLSearchParams();
  if (params.page) query.set("page", String(params.page));
  if (params.perPage) query.set("perPage", String(params.perPage));
  if (params.search) query.set("search", params.search);
  return apiFetch<GithubRepositoriesResponse>(`/api/v1/github/repositories?${query}`);
}

/** The signed-in user's already-imported repositories. */
export function listRepositories(cursor?: string, pageSize = 20): Promise<RepositoriesListResponse> {
  const query = new URLSearchParams({ pageSize: String(pageSize) });
  if (cursor) query.set("cursor", cursor);
  return apiFetch<RepositoriesListResponse>(`/api/v1/repositories?${query}`);
}

export function importRepository(body: ImportRepositoryRequest): Promise<ImportRepositoryResponse> {
  return apiFetch<ImportRepositoryResponse>("/api/v1/repositories/import", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

/** Soft-deletes immediately; the full cascade (indexer, ai, S3) finishes asynchronously (DATA_RETENTION_AND_PRIVACY.md "Repository deletion"). */
export function deleteRepository(repoId: string): Promise<DeleteRepositoryResponse> {
  return apiFetch<DeleteRepositoryResponse>(`/api/v1/repositories/${repoId}`, { method: "DELETE" });
}

// `/tree` returns nested nodes lazily to `TREE_DEPTH` levels (GRAPH_SERVICE_PLAN.md "/tree ... nested
// structure with lazy children"); folders deeper than that arrive with `hasChildren: true` but no
// `children` and won't expand until FileTree gains re-query-on-expand support.
const TREE_DEPTH = 10;

function toFileNode(node: TreeNodeDto): FileNode {
  return {
    id: node.id,
    name: node.name,
    type: node.type === "directory" ? "folder" : "file",
    language: node.language ?? undefined,
    children: node.children?.map(toFileNode),
  };
}

function countFiles(nodes: FileNode[]): number {
  return nodes.reduce((sum, node) => sum + (node.type === "file" ? 1 : 0) + countFiles(node.children ?? []), 0);
}

export function getFileTree(repoId: string, path?: string): Promise<FileTreeResponse> {
  const params = new URLSearchParams({ depth: String(TREE_DEPTH), ...(path && { path }) });
  return apiFetch<TreeResponse>(`/api/v1/repositories/${repoId}/tree?${params}`).then((tree) => {
    const nodes = tree.root.children?.map(toFileNode) ?? [];
    return { nodes, totalFiles: countFiles(nodes) };
  });
}

export function getLanguageBreakdown(repoId: string): Promise<LanguageBreakdown[]> {
  return apiFetch<LanguageBreakdown[]>(`/api/v1/repositories/${repoId}/languages`);
}

/** Latest indexing job for a repository — the polling fallback behind `useJobProgress` (DEVELOPMENT_STAGES.md Stage 4). */
export function getRepositoryJob(repoId: string): Promise<ProcessingJobDto> {
  return apiFetch<ProcessingJobDto>(`/api/v1/repositories/${repoId}/job`);
}
