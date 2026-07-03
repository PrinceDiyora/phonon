import ActivityLog from "../models/ActivityLog.js";

export const logActivity = async ({
  entityType,
  entityId,
  entityLabel,
  action,
  changes = {},
  actor = "Compliance Team",
}) => {
  try {
    await ActivityLog.create({
      entityType,
      entityId,
      entityLabel,
      action,
      changes,
      actor,
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};
