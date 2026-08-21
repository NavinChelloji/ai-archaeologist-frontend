import { useQuery } from "@tanstack/react-query";
import { getRepository, listGithubRepositories, listRepositories } from "../api/repositories-api";

/** The signed-in user's already-imported repositories (DEVELOPMENT_STAGES.md Stage 3). */
export function useMyRepositories(cursor?: string) {
  return useQuery({
    queryKey: ["repositories", "mine", cursor ?? null],
    queryFn: () => listRepositories(cursor),
  });
}

/** Live GitHub listing for the import screen — not cached across searches the way imported repos are. */
export function useGithubRepositories(params: { page?: number; perPage?: number; search?: string }) {
  return useQuery({
    queryKey: ["repositories", "github", params.page ?? 1, params.perPage ?? 30, params.search ?? ""],
    queryFn: () => listGithubRepositories(params),
    placeholderData: (previous) => previous,
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
