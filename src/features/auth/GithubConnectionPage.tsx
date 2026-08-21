import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import { githubLinkStartUrl } from "./auth-api";
import { GithubMark } from "../../shared/components/icons";
import styles from "./GithubConnectionPage.module.css";

export function GithubConnectionPage(): ReactElement {
  return (
    <div className={styles.page}>
      <section className={styles.card} aria-labelledby="github-title">
        <div className={styles.mark}><GithubMark size={72} /></div>
        <h1 id="github-title">Connect GitHub</h1>
        <p>Connect your GitHub account to analyze your repositories.</p>
        <a className={styles.connect} href={githubLinkStartUrl()}><GithubMark />Connect GitHub</a>
        <small>We never store your code.</small>
        <Link className={styles.back} to="/settings">Back to settings</Link>
      </section>
    </div>
  );
}
