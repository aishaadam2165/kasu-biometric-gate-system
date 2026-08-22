import Link from "next/link";
import styles from "./page.module.css";

export default function Home() {
  const modules = [
    { label: "Admin Authentication", status: "done", step: "Step 2" },
    { label: "Student Management", status: "done", step: "Step 3" },
    { label: "Biometric Enrolment", status: "done", step: "Step 4" },
    { label: "Gate Verification", status: "done", step: "Step 5" },
    { label: "Access Logs", status: "done", step: "Step 6" },
    { label: "Reports", status: "done", step: "Step 7" },
    { label: "Dashboard", status: "done", step: "Step 8" },
  ];

  return (
    <main className={styles.main}>
      <div className={styles.scanline} />

      <div className={styles.panel}>
        <img src="/kasu-logo.png" alt="KASU crest" className={styles.logo} />
        <div className={styles.eyebrow}>KADUNA STATE UNIVERSITY</div>
        <h1 className={styles.title}>Biometric Gate Access</h1>
        <p className={styles.subtitle}>
          Secure Hybrid Multi-Biometric Authentication System — Student
          Campus Gate Access Control
        </p>

        <div className={styles.divider} />

        <div className={styles.statusRow}>
          <span className={styles.dot} />
          <span className={styles.statusText}>SYSTEM ONLINE — ALL MODULES BUILT</span>
        </div>

        <ul className={styles.moduleList}>
          {modules.map((m) => (
            <li key={m.label} className={styles.moduleItem}>
              <span className={styles.moduleLabel}>{m.label}</span>
              <span className={m.status === "done" ? styles.moduleDone : styles.modulePending}>
                {m.status === "done" ? "✓ DONE" : m.step}
              </span>
            </li>
          ))}
        </ul>

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
