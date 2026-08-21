import { useQuery } from "@tanstack/react-query";
import { getFileTree } from "../api/repositories-api";

export function useFileTree(repoId: string, path?: string) {
  return useQuery({
    queryKey: ["fileTree", repoId, path],
    queryFn: () => getFileTree(repoId, path),
    enabled: !!repoId,
  });
}
