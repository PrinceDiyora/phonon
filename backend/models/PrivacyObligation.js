import mongoose from "mongoose";

const privacyObligationSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    obligationType: {
      type: String,
      enum: ["Consent Management", "Data Retention", "Breach Notification", "Data Subject Request", "Data Localization"],
      default: "Consent Management",
    },
    description: { type: String },
    status: { type: String, enum: ["Compliant", "In Progress", "Overdue", "Not Started"], default: "Not Started" },
    dueDate: { type: Date },
    owner: { type: String, default: "Unassigned" },
  },
  { timestamps: true }
);

export default mongoose.model("PrivacyObligation", privacyObligationSchema);
