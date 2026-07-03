# ComplianceHub — Enterprise Security & Compliance Platform

**22North Product Engineering Challenge 2026 — Challenge 6: Enterprise Security & Compliance**

## Team
- Team Name: `<fill in>`
- Team Members: `<fill in>`
- College Name: `<fill in>`

## Problem
An Enterprise SaaS company is preparing for SOC 2 Type II certification while complying with
India's DPDP Act. Compliance is currently managed through spreadsheets, causing gaps in
tracking risks, controls, audit evidence, and privacy obligations.

## What this MVP does
ComplianceHub gives a compliance/security team a single place to:
- **Risk Register** — log, categorize, and track organizational risks (severity, status, owner), linked to mitigating controls
- **Control Library** — track SOC 2 and DPDP control implementation status (Implemented / In Progress / Gap / Not Applicable), filterable by framework
- **Audit Evidence** — submit evidence against a control and run it through an approve/reject reviewer workflow
- **Privacy Obligations** — track DPDP-specific obligations (consent, retention, breach notification, data subject requests) with due dates and status
- **Dashboard** — a live compliance readiness view: open risk count, % control readiness, pending evidence reviews, overdue privacy obligations, and upcoming deadlines

## Scope decisions & assumptions
- Authentication is mocked entirely (per challenge constraints) — no login system; the app assumes a single internal compliance-team user.
- Compliance frameworks are simplified to two: SOC 2 (Security / Availability / Confidentiality) and DPDP Act — real SOC 2 has dozens of trust-service-criteria sub-controls, we modeled a representative subset.
- File evidence upload is simulated with a filename/description field rather than real file storage, to keep the 48-hour scope realistic.
- We prioritized workflows (risk → control → evidence linkage, and the evidence review cycle) over UI chrome, per the "focus on workflows" constraint, but still invested in a clean dashboard since it's the most demo-visible screen.

## Future enhancements (given more time)
- Real authentication with role-based access (Compliance Admin vs. Control Owner vs. Auditor/Reviewer)
- Actual file upload/storage (S3) for audit evidence with versioning
- Automated control-to-evidence expiry reminders and email notifications
- Framework template library (import a full SOC 2 Trust Services Criteria control set)
- Audit trail / activity log for every status change (who changed what, when) — required for real SOC 2 audits
- Export readiness report as PDF for auditors

## Tech Stack
- **Backend:** Node.js, Express, MongoDB (Mongoose)
- **Frontend:** React (Vite), React Router, Tailwind CSS, Recharts (charts), Axios

## Architecture
```
Browser (React SPA)
   │  REST calls (axios) → /api/*
   ▼
Express API (Node.js)
   │  Mongoose ODM
   ▼
MongoDB
   ├── risks
   ├── controls
   ├── evidence
   └── privacyobligations
```
The frontend dev server proxies `/api/*` requests to the backend (see `frontend/vite.config.js`), so no CORS configuration is needed in development beyond the `cors` middleware already enabled on the API.

## API Documentation

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |
| GET | `/risks` | List all risks |
| GET | `/risks/:id` | Get one risk |
| POST | `/risks` | Create a risk |
| PUT | `/risks/:id` | Update a risk (e.g. change status) |
| DELETE | `/risks/:id` | Delete a risk |
| GET | `/controls` | List all controls |
| POST | `/controls` | Create a control |
| PUT | `/controls/:id` | Update a control |
| DELETE | `/controls/:id` | Delete a control |
| GET | `/evidence` | List all evidence (populated with control) |
| POST | `/evidence` | Submit evidence |
| PUT | `/evidence/:id/review` | Approve/Reject/Reset evidence review |
| DELETE | `/evidence/:id` | Delete evidence |
| GET | `/obligations` | List all privacy obligations |
| POST | `/obligations` | Create an obligation |
| PUT | `/obligations/:id` | Update an obligation |
| DELETE | `/obligations/:id` | Delete an obligation |
| GET | `/dashboard/summary` | Aggregated stats for the dashboard |

## Database Schema (simplified)

**Risk**: title, description, category, severity, status, owner, controls[] (ref: Control)
**Control**: name, description, framework, status, owner, nextReviewDate
**Evidence**: control (ref: Control), title, description, fileName, submittedBy, reviewStatus, reviewerNotes, submittedAt
**PrivacyObligation**: title, obligationType, description, status, dueDate, owner

## Build & Run Instructions

### Prerequisites
- Node.js 18+
- MongoDB running locally (`mongodb://127.0.0.1:27017`) or a MongoDB Atlas connection string

### 1. Backend
```bash
cd backend
cp .env.example .env      # edit MONGO_URI if needed
npm install
npm run seed               # loads realistic demo data (risks, controls, evidence, obligations)
npm run dev                 # starts API on http://localhost:5000
```

### 2. Frontend
In a separate terminal:
```bash
cd frontend
npm install
npm run dev                 # starts React app on http://localhost:5173
```

Open **http://localhost:5173** — the dashboard should load with seeded data.

## Demo Script (suggested, ~5 minutes)
1. Open the **Dashboard** — show the live readiness numbers and charts (open risks, control readiness %, pending evidence, overdue obligations).
2. Go to **Risk Register** — show a Critical risk (e.g. "Unrestricted admin access"), change its status to "Mitigating," and point out the linked controls.
3. Go to **Controls** — filter by "DPDP Act," show a control in "Gap" status, mark it "In Progress."
4. Go to **Audit Evidence** — submit new evidence against a control, then approve it as a reviewer.
5. Go to **Privacy Obligations** — show an overdue obligation and explain the DPDP 72-hour breach notification requirement it maps to.
6. Return to **Dashboard** — show the numbers have updated live, tying the story together.
