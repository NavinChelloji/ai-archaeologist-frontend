import type {
  GithubRepositoriesResponse,
  ImportRepositoryRequest,
  ImportRepositoryResponse,
  ProcessingJobDto,
  RepositoriesListResponse,
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

export function getFileTree(repoId: string, path?: string): Promise<FileTreeResponse> {
  const params = new URLSearchParams({ ...(path && { path }) });
  return apiFetch<FileTreeResponse>(`/api/v1/repositories/${repoId}/files?${params}`);
}

export function getLanguageBreakdown(repoId: string): Promise<LanguageBreakdown[]> {
  return apiFetch<LanguageBreakdown[]>(`/api/v1/repositories/${repoId}/languages`);
}

/** Latest indexing job for a repository — the polling fallback behind `useJobProgress` (DEVELOPMENT_STAGES.md Stage 4). */
export function getRepositoryJob(repoId: string): Promise<ProcessingJobDto> {
  return apiFetch<ProcessingJobDto>(`/api/v1/repositories/${repoId}/job`);
}
