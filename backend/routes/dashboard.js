import express from "express";
import Risk from "../models/Risk.js";
import Control from "../models/Control.js";
import Evidence from "../models/Evidence.js";
import PrivacyObligation from "../models/PrivacyObligation.js";

const router = express.Router();

// In a production environment, role-based access control (RBAC) would be enforced here.

// Aggregated summary for the dashboard landing screen
router.get("/summary", async (req, res) => {
  try {
    let [risks, controls, evidence, obligations] = await Promise.all([
      Risk.find(),
      Control.find(),
      Evidence.find(),
      PrivacyObligation.find().lean(),
    ]);

    const now = new Date();
    obligations = obligations.map(ob => {
      if (ob.dueDate && new Date(ob.dueDate) < now && ob.status !== "Compliant") {
        ob.status = "Overdue";
      }
      return ob;
    });

    const risksBySeverity = { Low: 0, Medium: 0, High: 0, Critical: 0 };
    risks.forEach((r) => (risksBySeverity[r.severity] = (risksBySeverity[r.severity] || 0) + 1));

    const openRisks = risks.filter((r) => r.status === "Open" || r.status === "Mitigating").length;

    const controlsImplemented = controls.filter((c) => c.status === "Implemented").length;
    const controlReadinessPct = controls.length
      ? Math.round((controlsImplemented / controls.length) * 100)
      : 0;

    const controlsByStatus = { Implemented: 0, "In Progress": 0, Gap: 0, "Not Applicable": 0 };
    controls.forEach((c) => (controlsByStatus[c.status] = (controlsByStatus[c.status] || 0) + 1));

    const pendingEvidenceReview = evidence.filter((e) => e.reviewStatus === "Pending").length;

    // const now = new Date();
    const upcomingObligations = obligations
      .filter((o) => o.status !== "Compliant" && o.dueDate)
      .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
      .slice(0, 5);

    const overdueObligations = obligations.filter((o) => o.status === "Overdue").length;

    res.json({
      totals: {
        risks: risks.length,
        controls: controls.length,
        evidence: evidence.length,
        obligations: obligations.length,
      },
      openRisks,
      risksBySeverity,
      controlReadinessPct,
      controlsByStatus,
      pendingEvidenceReview,
      overdueObligations,
      upcomingObligations,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
