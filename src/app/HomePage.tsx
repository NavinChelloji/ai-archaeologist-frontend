import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { Button } from "../shared/components/Button";
import { Card } from "../shared/components/Card";
import { useAuth } from "../features/auth/auth-context";
import styles from "./HomePage.module.css";

/** Stage 2's "you're signed in" placeholder — the repository list replaces this in Stage 3. */
export function HomePage(): ReactElement {
  const { user, logout } = useAuth();

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        {user?.avatarUrl ? <img className={styles.avatar} src={user.avatarUrl} alt="" /> : null}
        <h1 className={styles.name}>{user?.displayName ?? user?.githubLogin}</h1>
        <p className={styles.login}>@{user?.githubLogin}</p>
        {user?.email ? <p className={styles.email}>{user.email}</p> : null}
        {user ? (
          <p className={styles.since}>Signed in since {new Date(user.createdAt).toLocaleDateString()}</p>
        ) : null}
        <Link to="/settings">Settings</Link>
        <Button className={styles.signOut} variant="danger" onClick={() => void logout()}>
          Sign out
        </Button>
      </Card>
    </div>
  );
}
