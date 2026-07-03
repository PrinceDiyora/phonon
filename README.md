# ComplianceHub — Enterprise Security & Compliance Platform

**22North Product Engineering Challenge 2026 — Challenge 6: Enterprise Security & Compliance**

## Team
- Team Name: `Team Coders`
- Team Members: `Prince Diyora`
- College Name: `CSPIT,Charusat`

## Live Link
Live Link - https://phonon-six.vercel.app

## Demo Link
Video link - https://drive.google.com/drive/folders/1jKLUr2RZyEdYLE_RuqJ7ab1po3Zqcmbe 

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
- **Activity Log / Audit Trail** — automatic tracking of all creates, updates, and deletes across the system
- **Compliance Reports** — one-click export of the compliance snapshot to CSV or a printable PDF-ready report

## Default Credentials & Roles
Since authentication is mocked for this MVP per challenge constraints, there is no real login page. Instead, the application uses a client-side simulated role-switcher (located at the bottom of the left navigation menu). 

**Available Dummy Roles:**
- **Compliance Admin:** Default role. Full edit access to add, edit, delete, and change the status of all records.
- **Auditor (Read-only):** Read-only view of all data. Forms, delete buttons, and edit actions are hidden or disabled.

*Note: In a production environment, you would log in with real credentials (e.g., admin@compliancehub.local / password123) and these roles would be strictly enforced by the backend.*

## Assumptions & Known Limitations
- **Mocked Auth:** Authentication is mocked entirely. The UI role switcher is client-side only; backend endpoints currently accept all requests without checking tokens.
- **Simplified Frameworks:** Frameworks are simplified to SOC 2 (Security/Availability/Confidentiality) and the DPDP Act. Real implementations have dozens of sub-controls.
- **Evidence Uploads:** File evidence upload is simulated with a filename text field rather than real blob storage (like S3), to keep the MVP scope realistic.
- **Overdue Logic:** Overdue status for obligations is calculated dynamically on-the-fly when reading from the database rather than mutated by a background cron job.

## Future enhancements (given more time)
- Real authentication (JWT/OAuth) with server-side role-based access control (RBAC).
- Actual file upload/storage (S3) for audit evidence with versioning.
- Automated control-to-evidence expiry reminders and email notifications.
- Framework template library (import a full SOC 2 Trust Services Criteria control set).

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

