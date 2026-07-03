import express from "express";
import ActivityLog from "../models/ActivityLog.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

// GET all activity (global feed)
router.get("/", async (req, res) => {
  try {
    const logs = await ActivityLog.find().sort({ timestamp: -1 }).limit(50);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET activity for specific entity
router.get("/:entityType/:entityId", async (req, res) => {
  try {
    const { entityType, entityId } = req.params;
    const logs = await ActivityLog.find({ entityType, entityId }).sort({ timestamp: -1 });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
