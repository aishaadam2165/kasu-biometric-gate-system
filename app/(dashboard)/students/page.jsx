"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import axios from "axios";
import StudentTable from "@/components/students/StudentTable";
import styles from "./students.module.css";

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/students", {
        params: { search, status },
      });
      setStudents(data.students);
    } finally {
      setLoading(false);
    }
  }, [search, status]);

  useEffect(() => {
    const timeout = setTimeout(fetchStudents, 300);
    return () => clearTimeout(timeout);
  }, [fetchStudents]);

  return (
    <div>
      <div className={styles.toolbar}>
        <input
          className={styles.search}
          placeholder="Search by matric number or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <select className={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="active">Active</option>
          <option value="inactive">Deactivated</option>
          <option value="all">All</option>
        </select>

        <Link href="/students/new" className={styles.newButton}>
          + Register Student
        </Link>
      </div>

      <div className={styles.panel}>
        {loading ? (
          <div className={styles.loading}>Loading…</div>
        ) : (
          <StudentTable students={students} />
        )}
      </div>
    </div>
  );
}
