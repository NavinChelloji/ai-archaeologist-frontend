import { useQuery } from "@tanstack/react-query";
import { getDependencyGraph, getSymbolGraph, getFolderGraph } from "../api/graph-api";

export function useDependencyGraph(repoId: string) {
  return useQuery({
    queryKey: ["graph", repoId, "dependencies"],
    queryFn: () => getDependencyGraph(repoId),
    enabled: !!repoId,
  });
}

export function useSymbolGraph(repoId: string, filePath?: string) {
  return useQuery({
    queryKey: ["graph", repoId, "symbols", filePath],
    queryFn: () => getSymbolGraph(repoId, filePath),
    enabled: !!repoId,
  });
}

export function useFolderGraph(repoId: string) {
  return useQuery({
    queryKey: ["graph", repoId, "folders"],
    queryFn: () => getFolderGraph(repoId),
    enabled: !!repoId,
  });
}
