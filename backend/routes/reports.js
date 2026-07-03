import express from "express";
import Risk from "../models/Risk.js";
import Control from "../models/Control.js";
import Evidence from "../models/Evidence.js";
import PrivacyObligation from "../models/PrivacyObligation.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

// GET full snapshot of the system
router.get("/snapshot", async (req, res) => {
  try {
    const [risks, controls, evidence, obligationsRaw] = await Promise.all([
      Risk.find().lean(),
      Control.find().lean(),
      Evidence.find().populate("control", "name framework").lean(),
      PrivacyObligation.find().lean(),
    ]);

    // Apply overdue logic to obligations
    const now = new Date();
    const obligations = obligationsRaw.map((o) => {
      if (o.dueDate && new Date(o.dueDate) < now && o.status !== "Compliant") {
        return { ...o, status: "Overdue" };
      }
      return o;
    });

    const openRisks = risks.filter((r) => r.status === "Open" || r.status === "Mitigating").length;
    const controlsImplemented = controls.filter((c) => c.status === "Implemented").length;
    const controlReadinessPct = controls.length
      ? Math.round((controlsImplemented / controls.length) * 100)
      : 0;
    const pendingEvidenceReview = evidence.filter((e) => e.reviewStatus === "Pending").length;
    const overdueObligations = obligations.filter((o) => o.status === "Overdue").length;

    res.json({
      generatedAt: new Date().toISOString(),
      summary: {
        openRisks,
        controlReadinessPct,
        pendingEvidenceReview,
        overdueObligations,
      },
      risks,
      controls,
      evidence,
      obligations,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
