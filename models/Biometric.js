import mongoose from "mongoose";

const BiometricSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true, unique: true },
    fingerprintTemplate: { type: String, default: null },
    fingerprintQuality: { type: Number, default: null },
    fingerprintEnrolledAt: { type: Date, default: null },
    faceEmbedding: { type: [Number], default: null },
    faceImage: { type: String, default: null },
    faceEnrolledAt: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.models.Biometric || mongoose.model("Biometric", BiometricSchema);
