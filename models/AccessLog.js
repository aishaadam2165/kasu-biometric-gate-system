import mongoose from "mongoose";

const AccessLogSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "Student", default: null },
    matricNumber: { type: String, required: true, trim: true, uppercase: true },
    method: { type: String, enum: ["fingerprint", "face"], required: true },
    result: { type: String, enum: ["granted", "denied"], required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    remarks: { type: String, default: "" },
  },
  { timestamps: true }
);

AccessLogSchema.index({ date: 1, matricNumber: 1 });

export default mongoose.models.AccessLog || mongoose.model("AccessLog", AccessLogSchema);
