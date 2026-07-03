import mongoose from "mongoose";

const riskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ["Access Control", "Data Security", "Availability", "Vendor", "Privacy", "Operational"],
      default: "Operational",
    },
    severity: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    status: { type: String, enum: ["Open", "Mitigating", "Closed", "Accepted"], default: "Open" },
    owner: { type: String, default: "Unassigned" },
    controls: [{ type: mongoose.Schema.Types.ObjectId, ref: "Control" }],
  },
  { timestamps: true }
);

export default mongoose.model("Risk", riskSchema);
