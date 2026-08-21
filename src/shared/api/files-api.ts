import { apiFetch } from "./client";

export interface Symbol {
  name: string;
  kind: "class" | "function" | "variable" | "type" | "interface" | "enum";
  line: number;
}

export interface FileImporter {
  id: string;
  name: string;
  path: string;
}

export interface FileViewResponse {
  id: string;
  path: string;
  name: string;
  language: string | null;
  content: string;
  lineCount: number;
  size: number;
  modifiedAt: string;
}

export interface FileMetadataResponse extends FileViewResponse {
  symbols: Symbol[];
  importers: FileImporter[];
}

export function getFileContent(fileId: string): Promise<FileViewResponse> {
  return apiFetch<FileViewResponse>(`/api/v1/files/${fileId}`);
}

export function getFileMetadata(fileId: string): Promise<FileMetadataResponse> {
  return apiFetch<FileMetadataResponse>(`/api/v1/files/${fileId}/metadata`);
}

export function getFileSymbols(fileId: string): Promise<Symbol[]> {
  return apiFetch<Symbol[]>(`/api/v1/files/${fileId}/symbols`);
}

export function getFileImporters(fileId: string): Promise<FileImporter[]> {
  return apiFetch<FileImporter[]>(`/api/v1/files/${fileId}/importers`);
}
