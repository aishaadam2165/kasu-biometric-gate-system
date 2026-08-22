import mongoose from "mongoose";

const StudentSchema = new mongoose.Schema(
  {
    matricNumber: {
      type: String,
      required: [true, "Matric number is required"],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: { type: String, required: [true, "Full name is required"], trim: true },
    department: { type: String, required: [true, "Department is required"], trim: true },
    level: { type: String, required: [true, "Level is required"], trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    passportPhoto: { type: String, default: null },
    isActive: { type: Boolean, default: true },
    isEnrolled: { type: Boolean, default: false },
    registeredBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
  },
  { timestamps: true }
);

export default mongoose.models.Student || mongoose.model("Student", StudentSchema);
