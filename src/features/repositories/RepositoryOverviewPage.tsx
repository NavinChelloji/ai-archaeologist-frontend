import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Card, Badge, LoadingState, ErrorState, DependencyGraph } from "../../shared/components";
import { useRepository } from "../../shared/hooks/useRepositories";
import { useDependencyGraph, useSymbolGraph } from "../../shared/hooks/useGraphs";
import styles from "./RepositoryOverviewPage.module.css";

interface LanguageStats {
  name: string;
  percentage: number;
  color: string;
}

export function RepositoryOverviewPage() {
  const { repoId } = useParams<{ repoId: string }>();
  const { data: repositoryData, isLoading, error, refetch } = useRepository(repoId ?? "");
  const { data: depGraph, isLoading: depLoading } = useDependencyGraph(repoId ?? "");
  const { data: symGraph, isLoading: symLoading } = useSymbolGraph(repoId ?? "");
  const [activeTab, setActiveTab] = useState<"overview" | "structure" | "dependencies" | "symbols" | "chat">("overview");

  const languageStats: LanguageStats[] = useMemo(() => {
    if (!repositoryData?.languages) return [];
    return repositoryData.languages.map((lang) => ({
      name: lang.name,
      percentage: lang.percentage,
      color: lang.color ?? "#999999",
    }));
  }, [repositoryData]);

  if (isLoading) {
    return <LoadingState message="Loading repository details..." />;
  }

  if (error || !repositoryData) {
    return (
      <ErrorState
        title="Failed to load repository"
        message={error instanceof Error ? error.message : "Could not load repository details"}
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{repositoryData.name}</h1>
          <p className={styles.description}>{repositoryData.description || "No description available"}</p>
          <div className={styles.meta}>
            <span>Language: {repositoryData.language || "Unknown"}</span>
          </div>
        </div>
        <a href={repositoryData.url} target="_blank" rel="noopener noreferrer">
          <Badge variant="primary">View on GitHub →</Badge>
        </a>
      </div>

      {/* Stats */}
      <div className={styles.statsGrid}>
        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📄</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{repositoryData.stats?.totalFiles ?? 0}</div>
            <div className={styles.statLabel}>Total Files</div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>🗣️</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{languageStats.length}</div>
            <div className={styles.statLabel}>Languages</div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>📝</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{((repositoryData.stats?.lineOfCode ?? 0) / 1000).toFixed(1)}k</div>
            <div className={styles.statLabel}>Lines of Code</div>
          </div>
        </Card>

        <Card className={styles.statCard}>
          <div className={styles.statIcon}>⚠️</div>
          <div className={styles.statContent}>
            <div className={styles.statValue}>{repositoryData.stats?.skippedFiles ?? 0}</div>
            <div className={styles.statLabel}>Skipped Files</div>
          </div>
        </Card>
      </div>

      {/* Language Breakdown */}
      <Card className={styles.languageCard}>
        <h2 className={styles.sectionTitle}>Language Breakdown</h2>
        <div className={styles.languageList}>
          {languageStats.map((lang) => (
            <div key={lang.name} className={styles.languageItem}>
              <div className={styles.languageInfo}>
                <div className={styles.languageColor} style={{ backgroundColor: lang.color }}></div>
                <span className={styles.languageName}>{lang.name}</span>
              </div>
              <div className={styles.languageBar}>
                <div className={styles.languageFill} style={{ width: `${lang.percentage}%`, backgroundColor: lang.color }}></div>
              </div>
              <span className={styles.languagePercentage}>{lang.percentage}%</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Tabs */}
      <div className={styles.tabs}>
        <div className={styles.tabList}>
          {["overview", "structure", "dependencies", "symbols", "chat"].map((tab) => (
            <button
              key={tab}
              className={[styles.tab, activeTab === tab && styles.active].filter(Boolean).join(" ")}
              onClick={() => setActiveTab(tab as any)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {activeTab === "overview" && (
            <Card>
              <div className={styles.tabText}>
                <p>Overview tab content - Repository summary information</p>
              </div>
            </Card>
          )}
          {activeTab === "structure" && (
            <Card>
              <div className={styles.tabText}>
                <p>Structure tab - Folder tree view (to be implemented)</p>
              </div>
            </Card>
          )}
          {activeTab === "dependencies" && (
            <Card>
              {depLoading ? (
                <LoadingState message="Loading dependency graph..." />
              ) : depGraph ? (
                <DependencyGraph nodes={depGraph.nodes} edges={depGraph.edges} />
              ) : (
                <div className={styles.tabText}>
                  <p>No dependency data available for this repository</p>
                </div>
              )}
            </Card>
          )}
          {activeTab === "symbols" && (
            <Card>
              {symLoading ? (
                <LoadingState message="Loading symbol graph..." />
              ) : symGraph ? (
                <DependencyGraph nodes={symGraph.nodes} edges={symGraph.edges} />
              ) : (
                <div className={styles.tabText}>
                  <p>No symbol data available for this repository</p>
                </div>
              )}
            </Card>
          )}
          {activeTab === "chat" && (
            <Card>
              <div className={styles.tabText}>
                <p>Chat tab - Repo-aware chat (to be implemented)</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
