"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import styles from "./login.module.css";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(err?.response?.data?.error || "Unable to log in. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.main}>
      <div className={styles.scanline} />

      <form className={styles.panel} onSubmit={handleSubmit}>
        <img src="/kasu-logo.png" alt="KASU crest" className={styles.logo} />
        <div className={styles.eyebrow}>KADUNA STATE UNIVERSITY</div>
        <h1 className={styles.title}>Admin Access</h1>
        <p className={styles.subtitle}>
          Sign in to manage students, biometrics, and gate access records.
        </p>

        <div className={styles.divider} />

        <label className={styles.label} htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="username"
          className={styles.input}
          placeholder="admin@kasu.edu.ng"
        />

        <label className={styles.label} htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          className={styles.input}
          placeholder="••••••••"
        />

        {error && <div className={styles.error}>{error}</div>}

        <button type="submit" disabled={submitting} className={styles.button}>
          {submitting ? "Signing in…" : "Sign In"}
        </button>
      </form>
    </main>
  );
}
