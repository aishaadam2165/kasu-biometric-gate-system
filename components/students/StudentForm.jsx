"use client";

import { useForm } from "react-hook-form";
import styles from "./StudentForm.module.css";

/**
 * Shared form for both creating and editing a student. Submits as
 * FormData (not JSON) so the passport photo travels in the same request,
 * consistent with the native FormData upload approach used across the API.
 */
export default function StudentForm({ initialData, onSubmit, submitLabel = "Save" }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      matricNumber: initialData?.matricNumber || "",
      fullName: initialData?.fullName || "",
      department: initialData?.department || "",
      level: initialData?.level || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
    },
  });

  async function submit(values) {
    const formData = new FormData();
    Object.entries(values).forEach(([key, value]) => {
      if (key === "passportPhoto") return;
      formData.append(key, value ?? "");
    });

    const fileInput = document.getElementById("passportPhoto");
    if (fileInput?.files?.[0]) {
      formData.append("passportPhoto", fileInput.files[0]);
    }

    await onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className={styles.form}>
      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="matricNumber">Matric Number</label>
          <input
            id="matricNumber"
            className={styles.input}
            placeholder="U20CS1001"
            {...register("matricNumber", { required: "Matric number is required." })}
          />
          {errors.matricNumber && <span className={styles.error}>{errors.matricNumber.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            className={styles.input}
            placeholder="Ayeeshat Ibrahim"
            {...register("fullName", { required: "Full name is required." })}
          />
          {errors.fullName && <span className={styles.error}>{errors.fullName.message}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="department">Department</label>
          <input
            id="department"
            className={styles.input}
            placeholder="Computer Science"
            {...register("department", { required: "Department is required." })}
          />
          {errors.department && <span className={styles.error}>{errors.department.message}</span>}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="level">Level</label>
          <input
            id="level"
            className={styles.input}
            placeholder="400"
            {...register("level", { required: "Level is required." })}
          />
          {errors.level && <span className={styles.error}>{errors.level.message}</span>}
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="email">Email (optional)</label>
          <input
            id="email"
            type="email"
            className={styles.input}
            placeholder="student@kasu.edu.ng"
            {...register("email")}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="phone">Phone (optional)</label>
          <input id="phone" className={styles.input} placeholder="080…" {...register("phone")} />
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="passportPhoto">
          Passport Photo (optional — JPEG/PNG/WEBP, max 3MB)
        </label>
        <input
          id="passportPhoto"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
        />
      </div>

      <button type="submit" disabled={isSubmitting} className={styles.button}>
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
