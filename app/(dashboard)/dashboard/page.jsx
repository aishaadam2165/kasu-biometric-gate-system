"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/hooks/useAuth";
import StatsCard from "@/components/dashboard/StatsCard";
import ActivityChart from "@/components/dashboard/ActivityChart";
import RecentLogsTable from "@/components/dashboard/RecentLogsTable";
import styles from "./dashboard.module.css";

export default function DashboardPage() {
  const { admin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("/api/dashboard/stats")
      .then(({ data }) => setStats(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading || !stats) {
    return <div className={styles.loading}>Loading…</div>;
  }

  return (
    <div>
      <p className={styles.welcome}>
        Welcome back, <strong>{admin?.name}</strong>. Here's what's happening at the gate today.
      </p>

      <div className={styles.statsGrid}>
        <StatsCard label="Total Students" value={stats.totalStudents} color="cyan" />
        <StatsCard label="Active Students" value={stats.activeStudents} color="cyan" />
        <StatsCard label="Enrolled" value={stats.enrolledStudents} color="cyan" />
        <StatsCard label="Today's Attempts" value={stats.todayAttempts} color="amber" />
        <StatsCard label="Granted Today" value={stats.todayGranted} color="green" />
        <StatsCard label="Denied Today" value={stats.todayDenied} color="red" />
      </div>

      <div className={styles.mainGrid}>
        <ActivityChart data={stats.chartData} />
        <RecentLogsTable logs={stats.recentLogs} />
      </div>
    </div>
  );
}
