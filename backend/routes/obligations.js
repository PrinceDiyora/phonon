import express from "express";
import PrivacyObligation from "../models/PrivacyObligation.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

router.get("/", async (req, res) => {
  try {
    let obligations = await PrivacyObligation.find().sort({ dueDate: 1 }).lean();
    
    const now = new Date();
    obligations = obligations.map(ob => {
      if (new Date(ob.dueDate) < now && ob.status !== "Compliant") {
        ob.status = "Overdue";
      }
      return ob;
    });

    res.json(obligations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const obligation = await PrivacyObligation.create(req.body);
    await logActivity({
      entityType: "PrivacyObligation",
      entityId: obligation._id,
      entityLabel: obligation.title,
      action: "Created",
      actor: req.body.actor,
    });
    res.status(201).json(obligation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const oldObligation = await PrivacyObligation.findById(req.params.id);
    if (!oldObligation) return res.status(404).json({ error: "Obligation not found" });

    const changes = {};
    for (const key in req.body) {
      if (key === "actor") continue;
      if (req.body[key] !== oldObligation[key]?.toString() && req.body[key] !== oldObligation[key]) {
        changes[key] = { from: oldObligation[key], to: req.body[key] };
      }
    }

    const obligation = await PrivacyObligation.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    
    if (Object.keys(changes).length > 0) {
      await logActivity({
        entityType: "PrivacyObligation",
        entityId: obligation._id,
        entityLabel: obligation.title,
        action: "Updated",
        changes,
        actor: req.body.actor,
      });
    }

    res.json(obligation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const obligation = await PrivacyObligation.findByIdAndDelete(req.params.id);
    if (!obligation) return res.status(404).json({ error: "Obligation not found" });

    await logActivity({
      entityType: "PrivacyObligation",
      entityId: obligation._id,
      entityLabel: obligation.title,
      action: "Deleted",
      actor: req.body.actor,
    });

    res.json({ message: "Obligation deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
