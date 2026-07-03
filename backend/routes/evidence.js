import express from "express";
import Evidence from "../models/Evidence.js";
import { logActivity } from "../utils/activityLogger.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

router.get("/", async (req, res) => {
  try {
    const evidence = await Evidence.find().populate("control", "name framework status").sort({ createdAt: -1 });
    res.json(evidence);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const evidence = await Evidence.create(req.body);
    await logActivity({
      entityType: "Evidence",
      entityId: evidence._id,
      entityLabel: evidence.title || `Evidence for control ${evidence.control}`,
      action: "Created",
      actor: req.body.actor,
    });
    res.status(201).json(evidence);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Reviewer approve/reject workflow
router.put("/:id/review", async (req, res) => {
  try {
    const { reviewStatus, reviewerNotes } = req.body;
    if (!["Approved", "Rejected", "Pending"].includes(reviewStatus)) {
      return res.status(400).json({ error: "Invalid reviewStatus" });
    }
    const oldEvidence = await Evidence.findById(req.params.id);
    if (!oldEvidence) return res.status(404).json({ error: "Evidence not found" });

    const changes = {};
    if (reviewStatus !== oldEvidence.reviewStatus) {
      changes.reviewStatus = { from: oldEvidence.reviewStatus, to: reviewStatus };
    }
    if (reviewerNotes !== oldEvidence.reviewerNotes) {
      changes.reviewerNotes = { from: oldEvidence.reviewerNotes, to: reviewerNotes };
    }

    const evidence = await Evidence.findByIdAndUpdate(
      req.params.id,
      { reviewStatus, reviewerNotes },
      { new: true }
    );
    
    if (Object.keys(changes).length > 0) {
      await logActivity({
        entityType: "Evidence",
        entityId: evidence._id,
        entityLabel: evidence.title || `Evidence for control ${evidence.control}`,
        action: "Updated",
        changes,
        actor: req.body.actor,
      });
    }

    res.json(evidence);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const evidence = await Evidence.findByIdAndDelete(req.params.id);
    if (!evidence) return res.status(404).json({ error: "Evidence not found" });

    await logActivity({
      entityType: "Evidence",
      entityId: evidence._id,
      entityLabel: evidence.title || `Evidence for control ${evidence.control}`,
      action: "Deleted",
      actor: req.body.actor,
    });

    res.json({ message: "Evidence deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
