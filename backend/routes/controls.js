import express from "express";
import Control from "../models/Control.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

router.get("/", async (req, res) => {
  try {
    const controls = await Control.find().sort({ createdAt: -1 });
    res.json(controls);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const control = await Control.findById(req.params.id);
    if (!control) return res.status(404).json({ error: "Control not found" });
    res.json(control);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const control = await Control.create(req.body);
    await logActivity({
      entityType: "Control",
      entityId: control._id,
      entityLabel: control.name,
      action: "Created",
      actor: req.body.actor,
    });
    res.status(201).json(control);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const oldControl = await Control.findById(req.params.id);
    if (!oldControl) return res.status(404).json({ error: "Control not found" });

    const changes = {};
    for (const key in req.body) {
      if (key === "actor") continue;
      if (req.body[key] !== oldControl[key]?.toString() && req.body[key] !== oldControl[key]) {
        changes[key] = { from: oldControl[key], to: req.body[key] };
      }
    }

    const control = await Control.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (Object.keys(changes).length > 0) {
      await logActivity({
        entityType: "Control",
        entityId: control._id,
        entityLabel: control.name,
        action: "Updated",
        changes,
        actor: req.body.actor,
      });
    }

    res.json(control);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const control = await Control.findByIdAndDelete(req.params.id);
    if (!control) return res.status(404).json({ error: "Control not found" });

    await logActivity({
      entityType: "Control",
      entityId: control._id,
      entityLabel: control.name,
      action: "Deleted",
      actor: req.body.actor,
    });

    res.json({ message: "Control deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
