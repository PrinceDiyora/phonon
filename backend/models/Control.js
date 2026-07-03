import mongoose from "mongoose";

const controlSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    framework: {
      type: String,
      enum: ["SOC 2 - Security", "SOC 2 - Availability", "SOC 2 - Confidentiality", "DPDP Act"],
      default: "SOC 2 - Security",
    },
    status: {
      type: String,
      enum: ["Implemented", "In Progress", "Gap", "Not Applicable"],
      default: "Gap",
    },
    owner: { type: String, default: "Unassigned" },
    nextReviewDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Control", controlSchema);
