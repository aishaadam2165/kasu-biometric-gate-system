"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/students", label: "Students" },
  { href: "/logs", label: "Access Logs" },
  { href: "/reports", label: "Reports" },
  { href: "/settings", label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <img src="/kasu-logo.png" alt="KASU crest" className={styles.brandLogo} />
        <div className={styles.brandText}>
          <div className={styles.brandEyebrow}>KASU</div>
          <div className={styles.brandTitle}>Gate Access</div>
        </div>
      </div>

      <nav className={styles.nav}>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ""}`}
            >
              {isActive && <span className={styles.activeBar} />}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
