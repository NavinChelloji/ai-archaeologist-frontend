import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Badge, Card, Button } from "../../shared/components";
import styles from "./RepositoryDashboardPage.module.css";

interface StatCard {
  label: string;
  value: string | number;
  icon: string;
  color: "primary" | "success" | "warning" | "danger";
}

export function RepositoryDashboardPage() {
  // Mock data - replace with API call
  const stats: StatCard[] = useMemo(
    () => [
      { label: "Repositories", value: 12, icon: "📦", color: "primary" },
      { label: "Analyzed", value: 8, icon: "✓", color: "success" },
      { label: "Total Files", value: 256, icon: "📄", color: "warning" },
      { label: "Lines of Code", value: "24.5k", icon: "📝", color: "danger" },
    ],
    []
  );

  const recentRepositories = [
    {
      id: "1",
      name: "ai-archaeologist-backend",
      language: "TypeScript",
      analyzeDate: "2 hours ago",
    },
    {
      id: "2",
      name: "frontend-app",
      language: "React",
      analyzeDate: "1 day ago",
    },
    {
      id: "3",
      name: "python-lib",
      language: "Python",
      analyzeDate: "5 days ago",
    },
  ];

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.subtitle}>Welcome back, John! 👋</p>
        </div>
        <Link to="/repositories/import">
          <Button variant="primary">+ Import Repository</Button>
        </Link>
      </div>

      <div className={styles.stats}>
        {stats.map((stat) => (
          <Card key={stat.label} className={styles.statCard}>
            <div className={styles.statIcon}>{stat.icon}</div>
            <div className={styles.statContent}>
              <div className={styles.statValue}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Recent Repositories</h2>
        <div className={styles.repositoriesList}>
          {recentRepositories.map((repo) => (
            <Link key={repo.id} to={`/repositories/${repo.id}`}>
              <Card className={styles.repositoryCard}>
                <div className={styles.repoHeader}>
                  <h3 className={styles.repoName}>{repo.name}</h3>
                  <Badge variant="primary">{repo.language}</Badge>
                </div>
                <p className={styles.repoMeta}>
                  Analyzed {repo.analyzeDate}
                </p>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Next Steps</h2>
        <Card>
          <ul className={styles.stepsList}>
            <li>📊 Explore the dependency graph of your imported repositories</li>
            <li>💬 Ask AI Archaeologist questions about your codebase</li>
            <li>📁 View folder structures and understand file relationships</li>
            <li>🔍 Search symbols and dependencies across projects</li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
