"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import StudentForm from "@/components/students/StudentForm";
import styles from "./new.module.css";

export default function NewStudentPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData) {
    setError("");
    try {
      await axios.post("/api/students", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      router.push("/students");
    } catch (err) {
      setError(err?.response?.data?.error || "Failed to register student.");
    }
  }

  return (
    <div>
      <h3 className={styles.heading}>Register New Student</h3>
      <p className={styles.subheading}>
        Biometric enrolment (fingerprint + face) happens separately once
        the profile is saved.
      </p>

      {error && <div className={styles.error}>{error}</div>}

      <StudentForm onSubmit={handleSubmit} submitLabel="Register Student" />
    </div>
  );
}
