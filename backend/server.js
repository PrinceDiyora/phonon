import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

import riskRoutes from "./routes/risks.js";
import controlRoutes from "./routes/controls.js";
import evidenceRoutes from "./routes/evidence.js";
import obligationRoutes from "./routes/obligations.js";
import dashboardRoutes from "./routes/dashboard.js";
import activityRoutes from "./routes/activity.js";
import reportsRoutes from "./routes/reports.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/risks", riskRoutes);
app.use("/api/controls", controlRoutes);
app.use("/api/evidence", evidenceRoutes);
app.use("/api/obligations", obligationRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/reports", reportsRoutes);

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
