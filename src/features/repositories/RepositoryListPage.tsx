import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { Card, Input, Button, Badge } from "../../shared/components";
import styles from "./RepositoryListPage.module.css";

interface Repository {
  id: string;
  name: string;
  description?: string;
  language: string;
  stars: number;
  lastAnalyzed?: string;
  isImported: boolean;
  isPrivate: boolean;
}

export function RepositoryListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Mock data - replace with API call
  const allRepositories: Repository[] = useMemo(
    () => [
      {
        id: "1",
        name: "ai-archaeologist-backend",
        description: "NestJS backend service",
        language: "TypeScript",
        stars: 2300,
        lastAnalyzed: "2 hours ago",
        isImported: true,
        isPrivate: false,
      },
      {
        id: "2",
        name: "frontend-app",
        description: "React frontend application",
        language: "React",
        stars: 1200,
        isImported: false,
        isPrivate: false,
      },
      {
        id: "3",
        name: "python-lib",
        description: "Python utility library",
        language: "Python",
        stars: 890,
        lastAnalyzed: "5 days ago",
        isImported: true,
        isPrivate: false,
      },
      {
        id: "4",
        name: "design-system",
        description: "UI component library",
        language: "TypeScript",
        stars: 450,
        isImported: false,
        isPrivate: true,
      },
    ],
    []
  );

  const filteredRepositories = useMemo(
    () =>
      allRepositories.filter(
        (repo) =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
      ),
    [searchQuery, allRepositories]
  );

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Repositories</h1>
          <p className={styles.subtitle}>Select a repository to analyze</p>
        </div>
      </div>

      <div className={styles.search}>
        <Input
          placeholder="Search repositories by name or description..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          icon="🔍"
        />
      </div>

      {filteredRepositories.length === 0 ? (
        <Card className={styles.emptyState}>
          <div className={styles.emptyContent}>
            <div className={styles.emptyIcon}>📦</div>
            <h2 className={styles.emptyTitle}>No repositories found</h2>
            <p className={styles.emptyText}>
              {searchQuery
                ? "Try adjusting your search terms"
                : "Connect your GitHub account to see your repositories"}
            </p>
          </div>
        </Card>
      ) : (
        <div className={styles.repositoriesGrid}>
          {filteredRepositories.map((repo) => (
            <Card key={repo.id} className={styles.repositoryCard}>
              <div className={styles.cardHeader}>
                <h3 className={styles.repoName}>{repo.name}</h3>
                <div className={styles.badges}>
                  {repo.isPrivate && <Badge variant="danger">Private</Badge>}
                  <Badge variant="primary">{repo.language}</Badge>
                </div>
              </div>

              {repo.description && (
                <p className={styles.repoDescription}>{repo.description}</p>
              )}

              <div className={styles.repoMeta}>
                <span>⭐ {repo.stars}</span>
                {repo.lastAnalyzed && (
                  <span>Analyzed {repo.lastAnalyzed}</span>
                )}
              </div>

              <Link to={`/repositories/${repo.id}`} className={styles.actionLink}>
                <Button
                  variant="primary"
                  fullWidth
                  className={styles.actionButton}
                >
                  {repo.isImported ? "View Analysis" : "Import Repository"}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
