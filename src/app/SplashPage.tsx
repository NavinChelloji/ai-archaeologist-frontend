import type { ReactElement } from "react";
import { Link } from "react-router-dom";
import styles from "./SplashPage.module.css";

export function SplashPage(): ReactElement {
  return (
    <main className={styles.page}>
      <section className={styles.splash} aria-labelledby="splash-title">
        <div className={styles.bot} aria-hidden="true">
          <span className={styles.antenna} />
          <span className={styles.face}><i /><i /></span>
        </div>
        <div>
          <h1 id="splash-title">AI ARCHITECT</h1>
          <p className={styles.product}>AI Code Archaeologist</p>
        </div>
        <p className={styles.tagline}>Uncover. Understand. Evolve.</p>
        <Link className={styles.enter} to="/login">Start exploring</Link>
      </section>
    </main>
  );
}
