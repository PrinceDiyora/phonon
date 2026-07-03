import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import mongoose from "mongoose";
import Risk from "./models/Risk.js";
import Control from "./models/Control.js";
import Evidence from "./models/Evidence.js";
import PrivacyObligation from "./models/PrivacyObligation.js";

dotenv.config();

const run = async () => {
  await connectDB();

  await Promise.all([
    Risk.deleteMany({}),
    Control.deleteMany({}),
    Evidence.deleteMany({}),
    PrivacyObligation.deleteMany({}),
  ]);

  const controls = await Control.insertMany([
    { name: "Least Privilege Access Control", framework: "SOC 2 - Security", status: "Implemented", owner: "Infra Team" },
    { name: "Encryption at Rest", framework: "SOC 2 - Confidentiality", status: "Implemented", owner: "Infra Team" },
    { name: "Quarterly Access Reviews", framework: "SOC 2 - Security", status: "In Progress", owner: "IT Security" },
    { name: "Incident Response Plan", framework: "SOC 2 - Availability", status: "Gap", owner: "Security Lead" },
    { name: "Vendor Risk Assessment", framework: "SOC 2 - Security", status: "Gap", owner: "Procurement" },
    { name: "Data Subject Consent Capture", framework: "DPDP Act", status: "In Progress", owner: "Privacy Team" },
    { name: "Data Retention Policy Enforcement", framework: "DPDP Act", status: "Gap", owner: "Privacy Team" },
    { name: "Multi-Factor Authentication", framework: "SOC 2 - Security", status: "Implemented", owner: "IT Security" },
  ]);

  const risks = await Risk.insertMany([
    {
      title: "Unrestricted admin access to production DB",
      description: "Multiple engineers have standing admin credentials without expiry.",
      category: "Access Control",
      severity: "Critical",
      status: "Open",
      owner: "IT Security",
      controls: [controls[0]._id, controls[2]._id],
    },
    {
      title: "No documented incident response runbook",
      description: "Team lacks a formal process for security incident escalation.",
      category: "Operational",
      severity: "High",
      status: "Mitigating",
      owner: "Security Lead",
      controls: [controls[3]._id],
    },
    {
      title: "Third-party vendors not risk-assessed",
      description: "Several SaaS vendors handling customer data have no signed DPA or risk review.",
      category: "Vendor",
      severity: "High",
      status: "Open",
      owner: "Procurement",
      controls: [controls[4]._id],
    },
    {
      title: "Consent records not centrally tracked",
      description: "User consent for data processing is scattered across product logs, not queryable.",
      category: "Privacy",
      severity: "Medium",
      status: "Mitigating",
      owner: "Privacy Team",
      controls: [controls[5]._id],
    },
    {
      title: "Backup restoration untested in 12 months",
      description: "Disaster recovery backups exist but restoration has not been drilled recently.",
      category: "Availability",
      severity: "Medium",
      status: "Open",
      owner: "Infra Team",
      controls: [],
    },
  ]);

  await Evidence.insertMany([
    {
      control: controls[0]._id,
      title: "IAM policy export Q2 2026",
      description: "Exported least-privilege IAM policies for review.",
      fileName: "iam-policy-q2-2026.pdf",
      submittedBy: "Infra Team",
      reviewStatus: "Approved",
      reviewerNotes: "Matches least-privilege baseline.",
    },
    {
      control: controls[1]._id,
      title: "KMS encryption configuration screenshot",
      fileName: "kms-config.png",
      submittedBy: "Infra Team",
      reviewStatus: "Approved",
    },
    {
      control: controls[2]._id,
      title: "Access review sign-off - May 2026",
      fileName: "access-review-may2026.xlsx",
      submittedBy: "IT Security",
      reviewStatus: "Pending",
    },
    {
      control: controls[7]._id,
      title: "MFA enrollment report",
      fileName: "mfa-enrollment.csv",
      submittedBy: "IT Security",
      reviewStatus: "Pending",
    },
  ]);

  await PrivacyObligation.insertMany([
    {
      title: "Publish updated privacy notice",
      obligationType: "Consent Management",
      status: "In Progress",
      dueDate: new Date("2026-07-15"),
      owner: "Privacy Team",
    },
    {
      title: "Implement 30-day data subject request SLA",
      obligationType: "Data Subject Request",
      status: "Not Started",
      dueDate: new Date("2026-07-20"),
      owner: "Privacy Team",
    },
    {
      title: "Define breach notification runbook (72hr rule)",
      obligationType: "Breach Notification",
      status: "Not Started",
      dueDate: new Date("2026-06-30"),
      owner: "Security Lead",
    },
    {
      title: "Retention policy for closed accounts",
      obligationType: "Data Retention",
      status: "In Progress",
      dueDate: new Date("2026-08-01"),
      owner: "Privacy Team",
    },
  ]);

  console.log("Seed data inserted successfully.");
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
