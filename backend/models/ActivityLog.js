import mongoose from "mongoose";

const activityLogSchema = new mongoose.Schema({
  entityType: {
    type: String,
    enum: ["Risk", "Control", "Evidence", "PrivacyObligation"],
    required: true,
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  entityLabel: {
    type: String, // e.g. the risk title, control name, etc.
    required: true,
  },
  action: {
    type: String,
    enum: ["Created", "Updated", "Deleted"],
    required: true,
  },
  changes: {
    type: mongoose.Schema.Types.Mixed, // { field: { from, to } }
    default: {},
  },
  actor: {
    type: String,
    default: "Compliance Team",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("ActivityLog", activityLogSchema);
