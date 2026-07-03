import mongoose from "mongoose";

const evidenceSchema = new mongoose.Schema(
  {
    control: { type: mongoose.Schema.Types.ObjectId, ref: "Control", required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileName: { type: String },
    submittedBy: { type: String, default: "Unknown" },
    reviewStatus: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    reviewerNotes: { type: String },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("Evidence", evidenceSchema);
