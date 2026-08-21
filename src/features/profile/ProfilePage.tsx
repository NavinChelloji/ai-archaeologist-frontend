import { Card, Button, Badge } from "../../shared/components";
import styles from "./ProfilePage.module.css";

export function ProfilePage() {
  // Mock user data - replace with API call
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "👤",
    githubHandle: "@johndoe",
    joinDate: "2024-01-15",
    repositoriesAnalyzed: 12,
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Profile</h1>

      <Card className={styles.profileCard}>
        <div className={styles.header}>
          <div className={styles.avatarSection}>
            <div className={styles.avatar}>{user.avatar}</div>
            <div>
              <h2 className={styles.name}>{user.name}</h2>
              <p className={styles.email}>{user.email}</p>
            </div>
          </div>
          <Button variant="neutral">Edit Profile</Button>
        </div>
      </Card>

      <Card className={styles.accountCard}>
        <h3 className={styles.sectionTitle}>Account Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>GitHub</label>
            <p className={styles.infoValue}>{user.githubHandle}</p>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Repositories Analyzed</label>
            <p className={styles.infoValue}>{user.repositoriesAnalyzed}</p>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Member Since</label>
            <p className={styles.infoValue}>
              {new Date(user.joinDate).toLocaleDateString()}
            </p>
          </div>
          <div className={styles.infoItem}>
            <label className={styles.infoLabel}>Status</label>
            <Badge variant="success">✓ Connected</Badge>
          </div>
        </div>
      </Card>

      <Card className={styles.statsCard}>
        <h3 className={styles.sectionTitle}>Statistics</h3>
        <div className={styles.statsList}>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📦</span>
            <span className={styles.statLabel}>Repositories</span>
            <span className={styles.statValue}>{user.repositoriesAnalyzed}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>💬</span>
            <span className={styles.statLabel}>Conversations</span>
            <span className={styles.statValue}>24</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>📊</span>
            <span className={styles.statLabel}>Files Analyzed</span>
            <span className={styles.statValue}>1,256</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statIcon}>⚡</span>
            <span className={styles.statLabel}>API Calls</span>
            <span className={styles.statValue}>842</span>
          </div>
        </div>
      </Card>

      <Card className={styles.dangerCard}>
        <h3 className={styles.sectionTitle} style={{ color: "var(--clay-danger)" }}>
          Danger Zone
        </h3>
        <p className={styles.dangerText}>
          These actions are irreversible. Please proceed with caution.
        </p>
        <Button variant="danger" fullWidth>
          Delete Account
        </Button>
      </Card>
    </div>
  );
}
