"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import styles from "./Navbar.module.css";

const TITLES = {
  "/dashboard": "Dashboard",
  "/students": "Students",
  "/logs": "Access Logs",
  "/reports": "Reports",
  "/settings": "Settings",
};

function titleForPath(pathname) {
  const match = Object.keys(TITLES).find(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  );
  return match ? TITLES[match] : "";
}

export default function Navbar() {
  const { admin, logout } = useAuth();
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <h2 className={styles.title}>{titleForPath(pathname)}</h2>

      <div className={styles.right}>
        <div className={styles.identity}>
          <div className={styles.name}>{admin?.name || "…"}</div>
          <div className={styles.email}>{admin?.email}</div>
        </div>
        <button className={styles.logoutButton} onClick={logout}>
          Log Out
        </button>
      </div>
    </header>
  );
}
