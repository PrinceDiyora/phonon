import express from "express";
import Risk from "../models/Risk.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

// GET all risks
router.get("/", async (req, res) => {
  try {
    const risks = await Risk.find().populate("controls", "name status").sort({ createdAt: -1 });
    res.json(risks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single risk
router.get("/:id", async (req, res) => {
  try {
    const risk = await Risk.findById(req.params.id).populate("controls");
    if (!risk) return res.status(404).json({ error: "Risk not found" });
    res.json(risk);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE risk
router.post("/", async (req, res) => {
  try {
    const risk = await Risk.create(req.body);
    await logActivity({
      entityType: "Risk",
      entityId: risk._id,
      entityLabel: risk.title,
      action: "Created",
      actor: req.body.actor,
    });
    res.status(201).json(risk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// UPDATE risk
router.put("/:id", async (req, res) => {
  try {
    const oldRisk = await Risk.findById(req.params.id);
    if (!oldRisk) return res.status(404).json({ error: "Risk not found" });

    const changes = {};
    for (const key in req.body) {
      if (key === "actor") continue;
      if (req.body[key] !== oldRisk[key]?.toString() && req.body[key] !== oldRisk[key]) {
        changes[key] = { from: oldRisk[key], to: req.body[key] };
      }
    }

    const risk = await Risk.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    
    if (Object.keys(changes).length > 0) {
      await logActivity({
        entityType: "Risk",
        entityId: risk._id,
        entityLabel: risk.title,
        action: "Updated",
        changes,
        actor: req.body.actor,
      });
    }

    res.json(risk);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE risk
router.delete("/:id", async (req, res) => {
  try {
    const risk = await Risk.findByIdAndDelete(req.params.id);
    if (!risk) return res.status(404).json({ error: "Risk not found" });

    await logActivity({
      entityType: "Risk",
      entityId: risk._id,
      entityLabel: risk.title,
      action: "Deleted",
      actor: req.body.actor,
    });

    res.json({ message: "Risk deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
