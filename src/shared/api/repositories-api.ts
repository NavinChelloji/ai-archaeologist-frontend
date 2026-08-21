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

export interface Repository {
  id: string;
  name: string;
  url: string;
  description?: string;
}

export function getRepository(repoId: string): Promise<RepositoryOverviewResponse> {
  return apiFetch<RepositoryOverviewResponse>(`/api/v1/repositories/${repoId}`);
}

export function getRepositories(limit = 20, offset = 0): Promise<{ repositories: Repository[]; total: number }> {
  const params = new URLSearchParams({ limit: limit.toString(), offset: offset.toString() });
  return apiFetch<{ repositories: Repository[]; total: number }>(`/api/v1/repositories?${params}`);
}

export function getFileTree(repoId: string, path?: string): Promise<FileTreeResponse> {
  const params = new URLSearchParams({ ...(path && { path }) });
  return apiFetch<FileTreeResponse>(`/api/v1/repositories/${repoId}/files?${params}`);
}

export function getLanguageBreakdown(repoId: string): Promise<LanguageBreakdown[]> {
  return apiFetch<LanguageBreakdown[]>(`/api/v1/repositories/${repoId}/languages`);
}
