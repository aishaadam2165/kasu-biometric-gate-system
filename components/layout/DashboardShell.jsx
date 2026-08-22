"use client";

import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import styles from "./DashboardShell.module.css";

export default function DashboardShell({ children }) {
  return (
    <div className={styles.wrapper}>
      <Sidebar />
      <div className={styles.contentColumn}>
        <Navbar />
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
