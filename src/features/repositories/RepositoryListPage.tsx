import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { GithubRepositoryDto } from "@aca/contracts";
import { Badge, Button, Card, ErrorState, Input, LoadingState } from "../../shared/components";
import { ApiError } from "../../shared/api/errors";
import { importRepository } from "../../shared/api/repositories-api";
import { useGithubRepositories, useMyRepositories } from "../../shared/hooks/useRepositories";
import styles from "./RepositoryListPage.module.css";

const SEARCH_DEBOUNCE_MS = 300;

export function RepositoryListPage() {
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const myRepos = useMyRepositories();
  const githubRepos = useGithubRepositories({ page, perPage: 30, search: search || undefined });
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const importedFullNames = useMemo(
    () => new Set((myRepos.data?.repositories ?? []).map((repo) => repo.fullName)),
    [myRepos.data]
  );

  const importMutation = useMutation({
    mutationFn: (providerRepoId: string) => importRepository({ providerRepoId }),
    onSuccess: (repository) => {
      void queryClient.invalidateQueries({ queryKey: ["repositories", "mine"] });
      // Import enqueues the indexing pipeline (DEVELOPMENT_STAGES.md Stage 4) — send the user to watch it run.
      navigate(`/repositories/${repository.repoId}/processing`);
    },
  });

  const githubError = githubRepos.error instanceof ApiError ? githubRepos.error : null;
  const needsGithubConnection = githubError?.code === "GITHUB_RECONNECT_REQUIRED";

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Repositories</h1>
          <p className={styles.subtitle}>Import a GitHub repository to start exploring it</p>
        </div>
      </div>

      {myRepos.data && myRepos.data.repositories.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Your repositories</h2>
          <div className={styles.repositoriesGrid}>
            {myRepos.data.repositories.map((repo) => (
              <Card key={repo.repoId} className={styles.repositoryCard}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.repoName}>{repo.fullName}</h3>
                  <div className={styles.badges}>
                    {repo.isPrivate && <Badge variant="danger">Private</Badge>}
                    {repo.primaryLanguage && <Badge variant="primary">{repo.primaryLanguage}</Badge>}
                  </div>
                </div>
                <Link to={`/repositories/${repo.repoId}`} className={styles.actionLink}>
                  <Button variant="primary" fullWidth className={styles.actionButton}>
                    View Repository
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Import from GitHub</h2>

        <div className={styles.search}>
          <Input
            placeholder="Search your GitHub repositories..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            icon="🔍"
          />
        </div>

        {githubRepos.isLoading && <LoadingState message="Loading your GitHub repositories..." />}

        {needsGithubConnection && (
          <Card className={styles.emptyState}>
            <div className={styles.emptyContent}>
              <div className={styles.emptyIcon}>🔗</div>
              <h2 className={styles.emptyTitle}>Connect GitHub to import a repository</h2>
              <p className={styles.emptyText}>You can still browse repositories you&apos;ve already imported above.</p>
              <Link to="/connect-github">
                <Button variant="primary">Connect GitHub</Button>
              </Link>
            </div>
          </Card>
        )}

        {githubError && !needsGithubConnection && (
          <ErrorState message={githubError.message} onRetry={() => void githubRepos.refetch()} />
        )}

        {githubRepos.data && (
          <>
            {githubRepos.data.repositories.length === 0 ? (
              <Card className={styles.emptyState}>
                <div className={styles.emptyContent}>
                  <div className={styles.emptyIcon}>📦</div>
                  <h2 className={styles.emptyTitle}>No repositories found</h2>
                  <p className={styles.emptyText}>
                    {search ? "Try adjusting your search terms" : "No repositories on this account yet"}
                  </p>
                </div>
              </Card>
            ) : (
              <div className={styles.repositoriesGrid}>
                {githubRepos.data.repositories.map((repo) => (
                  <GithubRepositoryCard
                    key={repo.providerRepoId}
                    repo={repo}
                    isImported={importedFullNames.has(repo.fullName)}
                    isImporting={importMutation.isPending && importMutation.variables === repo.providerRepoId}
                    onImport={() => importMutation.mutate(repo.providerRepoId)}
                  />
                ))}
              </div>
            )}

            <div className={styles.paginationRow}>
              <Button variant="neutral" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </Button>
              <Button
                variant="neutral"
                disabled={!githubRepos.data.hasNextPage}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface GithubRepositoryCardProps {
  repo: GithubRepositoryDto;
  isImported: boolean;
  isImporting: boolean;
  onImport: () => void;
}

function GithubRepositoryCard({ repo, isImported, isImporting, onImport }: GithubRepositoryCardProps) {
  return (
    <Card className={styles.repositoryCard}>
      <div className={styles.cardHeader}>
        <h3 className={styles.repoName}>{repo.fullName}</h3>
        <div className={styles.badges}>
          {repo.private && <Badge variant="danger">Private</Badge>}
          {repo.language && <Badge variant="primary">{repo.language}</Badge>}
        </div>
        {repo.description && <p className={styles.repoDescription}>{repo.description}</p>}
      </div>

      <div className={styles.repoMeta}>
        <span>⭐ {repo.stargazersCount}</span>
      </div>

      <Button
        variant={isImported ? "neutral" : "primary"}
        fullWidth
        className={styles.actionButton}
        disabled={isImported || isImporting}
        onClick={onImport}
      >
        {isImported ? "Imported" : isImporting ? "Importing..." : "Import Repository"}
      </Button>
    </Card>
  );
}
