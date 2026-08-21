import { useQuery } from "@tanstack/react-query";
import { getRepositories, getRepository } from "../api/repositories-api";
import type { RepositoryOverviewResponse, Repository } from "../api/repositories-api";

export function useRepositories(limit = 20, offset = 0) {
  return useQuery({
    queryKey: ["repositories", limit, offset],
    queryFn: () => getRepositories(limit, offset),
  });
}

export function useRepository(repoId: string) {
  return useQuery({
    queryKey: ["repository", repoId],
    queryFn: () => getRepository(repoId),
    enabled: !!repoId,
  });
}

export function useRepositoryStats(repoId: string) {
  return useQuery({
    queryKey: ["repository", repoId, "stats"],
    queryFn: () => getRepository(repoId).then((repo) => repo.stats),
    enabled: !!repoId,
  });
}
