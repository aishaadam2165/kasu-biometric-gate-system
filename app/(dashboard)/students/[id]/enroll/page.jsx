"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import EnrollmentStepper from "@/components/biometric/EnrollmentStepper";
import styles from "./enroll.module.css";

export default function EnrollPage() {
  const { id } = useParams();
  const router = useRouter();

  const [student, setStudent] = useState(null);
  const [biometricStatus, setBiometricStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      axios.get(`/api/students/${id}`),
      axios.get(`/api/biometrics/${id}`),
    ])
      .then(([studentRes, biometricRes]) => {
        setStudent(studentRes.data.student);
        setBiometricStatus(biometricRes.data.biometric);
      })
      .catch(() => setError("Could not load this student's enrolment status."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className={styles.loading}>Loading…</div>;
  if (error || !student) return <div className={styles.loading}>{error || "Student not found."}</div>;

  return (
    <div>
      <button className={styles.backLink} onClick={() => router.push(`/students/${id}`)}>
        ← Back to {student.fullName}
      </button>

      <h3 className={styles.heading}>Biometric Enrolment</h3>
      <p className={styles.subheading}>
        {student.fullName} · <span className="mono">{student.matricNumber}</span>
      </p>

      <div className={styles.stepperWrap}>
        <EnrollmentStepper studentId={id} initialStatus={biometricStatus} />
      </div>
    </div>
  );
}
