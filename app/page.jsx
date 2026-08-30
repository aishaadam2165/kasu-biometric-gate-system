
import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.scanline} />

      <div className={styles.panel}>
        <img
          src="/kasu-logo.png"
          alt="KASU crest"
          className={styles.logo}
        />

        <div className={styles.eyebrow}>
          KADUNA STATE UNIVERSITY
        </div>

        <h1 className={styles.title}>
          Biometric Gate Access
        </h1>

        <p className={styles.subtitle}>
          Secure Hybrid Multi-Biometric Authentication System — Student
          Campus Gate Access Control
        </p>

        <div className={styles.divider} />

        <Link href="/login" className={styles.loginLink}>
          Go to Admin Login →
        </Link>

        <Link href="/gate" className={styles.gateLink}>
          Open Gate Console →
        </Link>
      </div>
    </main>
  );
}
