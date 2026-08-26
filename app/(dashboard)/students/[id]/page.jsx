"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import StudentForm from "@/components/students/StudentForm";
import styles from "./detail.module.css";

export default function StudentDetailPage() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/students/${id}`)
      .then(({ data }) => setStudent(data.student))
      .catch(() => setError("Could not load this student."))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleSubmit(formData) {
    setError("");
    try {
      const { data } = await axios.put(`/api/students/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setStudent(data.student);
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to update student.");
    }
  }

  async function handleToggleActive() {
    setToggling(true);
    try {
      const { data } = await axios.post(`/api/students/${id}/deactivate`);
      setStudent(data.student);
    } finally {
      setToggling(false);
    }
  }

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (!student) return <div className={styles.loading}>{error || "Student not found."}</div>;

  return (
    <div>
      <button className={styles.backLink} onClick={() => router.push("/students")}>
        ← Back to Students
      </button>

      <div className={styles.infoCard}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.heading}>{student.fullName}</h3>
            <p className={styles.matric}>{student.matricNumber}</p>
          </div>

          <div className={styles.headerRight}>
            <span className={`${styles.badge} ${student.isActive ? styles.badgeGreen : styles.badgeRed}`}>
              {student.isActive ? "Active" : "Deactivated"}
            </span>
            <button
              className={student.isActive ? styles.deactivateButton : styles.reactivateButton}
              onClick={handleToggleActive}
              disabled={toggling}
            >
              {toggling ? "…" : student.isActive ? "Deactivate" : "Reactivate"}
            </button>
          </div>
        </div>

        <div className={styles.headerRowTwo}>
          <p className={styles.note}>
            Biometric enrolment: {student.isEnrolled ? "complete" : "not complete"}.
          </p>
          <button className={styles.enrollButton} onClick={() => router.push(`/students/${id}/enroll`)}>
            {student.isEnrolled ? "View / Re-enrol Biometrics" : "Enrol Biometrics →"}
          </button>
        </div>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      <StudentForm initialData={student} onSubmit={handleSubmit} submitLabel="Save Changes" />
    </div>
  );
}
