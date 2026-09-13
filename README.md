# Repair & Maintenance Management System

A web-based system for managing repair complaints from registration through assignment, action taken, verification, and closure.

The system is designed for the Panimalar Engineering College repair and maintenance workflow.

## Project Overview

The Repair & Maintenance Management System provides a centralized workflow for:

* Registering repair complaints
* Approving complaints
* Assigning electricians
* Tracking repair progress
* Recording action-taken reports
* Verifying completed repairs
* Closing verified complaints
* Maintaining complaint status and audit history

The application consists of a React frontend, Node.js/Express backend, and PostgreSQL database managed through Prisma.

---

## System Roles

The application supports the following user roles:

| Role                   | Main Responsibilities                                                                                |
| ---------------------- | ---------------------------------------------------------------------------------------------------- |
| `SUPERVISOR`           | Create complaints, view complaints, and participate in assignment                                    |
| `HOD`                  | Review pending complaints, approve/reject complaints, view complaints, and participate in assignment |
| `ELECTRICIAN_INCHARGE` | Assign work, verify repairs, and close complaints                                                    |
| `ELECTRICIAN_HEAD`     | Assign work, verify repairs, and close complaints                                                    |
| `ELECTRICIAN`          | View assigned jobs, update job status, and submit action-taken reports                               |
| `MANAGER`              | Participate in assignment, verify repairs, and close complaints                                      |
| `DEAN_IQAC`            | Read complaint lists and complaint details                                                           |

Backend role-based access control is authoritative. Frontend visibility is provided for convenience and must not be treated as the security boundary.

---

## Repair-Ticket Lifecycle

The current core complaint lifecycle is:

```text
COMPLAINT_REGISTERED
        ↓
REPAIR_ASSIGNED
        ↓
ACTION_TAKEN
        ↓
VERIFICATION
        ↓
CLOSED
```

### Status Definitions

| Status                 | Meaning                                                                        |
| ---------------------- | ------------------------------------------------------------------------------ |
| `COMPLAINT_REGISTERED` | Complaint has been created and registered in the system                        |
| `REPAIR_ASSIGNED`      | The complaint has been opened for work and assigned to an electrician          |
| `ACTION_TAKEN`         | Repair work and the action-taken report have been completed/submitted          |
| `VERIFICATION`         | The repair is being checked by an authorized verifier                          |
| `CLOSED`               | The repair has been successfully verified and the complaint is closed          |
| `OVERDUE`              | The complaint has exceeded its applicable SLA                                  |
| `ESCALATED`            | The complaint has been escalated because an escalation condition was triggered |

`OVERDUE` and `ESCALATED` are exception states and are not normal sequential stages of the repair lifecycle.

### Approval Lifecycle

```text
PENDING → APPROVED
PENDING → REJECTED
```

### Assignment Lifecycle

```text
ASSIGNED → IN_PROGRESS → COMPLETED
```

A complaint cannot be closed until the required repair assignment is completed and successful verification has been performed.

---

## Technology Stack

| Layer               | Technology                |
| ------------------- | ------------------------- |
| Frontend            | React                     |
| Frontend Build Tool | Vite                      |
| Styling             | Tailwind CSS              |
| Backend             | Node.js + Express         |
| Database            | PostgreSQL                |
| ORM                 | Prisma                    |
| Authentication      | JWT                       |
| Testing             | Node Test Runner + Vitest |
| CI                  | GitHub Actions            |

---

## Project Structure

```text
main-project1/
├── frontend/                 # React + Vite frontend
├── backend/                  # Express backend and Prisma
│   ├── prisma/               # Prisma schema, migrations and seed scripts
│   ├── src/                  # Backend application source
│   └── test/                 # Backend tests
├── database/                 # Database-related project area
├── .github/
│   └── workflows/
│       └── ci.yml            # Continuous integration workflow
├── .env.example              # Environment-variable template
├── .gitignore
├── INTEGRATION.md            # Integration, API and workflow documentation
├── package.json              # Root workspace scripts
└── server.js                 # Root runtime entrypoint
```

---

# Local Development Setup

## Prerequisites

Install the following before starting:

* Node.js 22 or a compatible current Node.js version
* npm
* PostgreSQL database or an approved development database
* Git

The repository CI workflow currently uses Node.js 22.

---

## 1. Clone the Repository

```bash
git clone https://github.com/midhilesh38/main-project1.git
cd main-project1
```

---

## 2. Configure Environment Variables

The repository provides `.env.example` as a template.

Copy the template to the appropriate local environment file and provide your own local values.

### Backend variables

The backend uses:

```text
DATABASE_URL
JWT_SECRET
PORT
```

Example format:

```text
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=<your-local-jwt-secret>
PORT=5000
```

### Frontend variable

The frontend can use:

```text
VITE_API_BASE_URL
```

Example:

```text
VITE_API_BASE_URL=http://localhost:5000
```

The Vite development configuration can proxy API requests to the backend, so the frontend variable may not be required for the normal local setup.

### Security Rules

**Never commit:**

* `.env`
* Database passwords
* JWT secrets
* API keys
* Access tokens
* Authentication credentials

Only variable names and safe placeholders should be documented or committed.

The repository `.gitignore` excludes `.env`, `.env.local`, and other local environment files.

---

# Backend Setup

Open a terminal in the project root:

```bash
cd backend
npm install
```

Generate the Prisma client:

```bash
npm run prisma:generate
```

Validate the Prisma schema:

```bash
npm run prisma:validate
```

Start the backend in development mode:

```bash
npm run dev
```

The backend development server runs from:

```text
backend/src/server.js
```

The Express application itself is created by:

```text
backend/src/app.js
```

---

# Frontend Setup

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend development server is provided by Vite.

The terminal will display the local URL provided by Vite, normally similar to:

```text
http://localhost:5173
```

Keep the backend and frontend running in separate terminals during development.

---

# Root-Level Commands

The repository also provides workspace commands from the project root.

Install dependencies for the required workspaces:

```bash
npm install
```

Build the frontend and prepare the root distribution directory:

```bash
npm run build
```

Start the root application:

```bash
npm start
```

Run the development application:

```bash
npm run dev
```

Run the configured root test command:

```bash
npm test
```

Run the configured root lint command:

```bash
npm run lint
```

For detailed checks, use the backend and frontend commands described below.

---

# Testing

## Backend

From `backend/`:

```bash
npm test
```

Backend tests use the Node.js built-in test runner.

## Frontend

From `frontend/`:

```bash
npm test
```

Frontend tests use Vitest.

## Frontend Lint

```bash
cd frontend
npm run lint
```

## Backend Lint

```bash
cd backend
npm run lint
```

The backend lint command performs JavaScript syntax checks on the main backend source files.

---

# Build Verification

## Backend

From `backend/`:

```bash
npm run build
```

The backend build script currently performs the configured backend lint check.

## Frontend

From `frontend/`:

```bash
npm run build
```

## Full Frontend Build Through Root

From the project root:

```bash
npm run build
```

The root build:

1. Builds the frontend.
2. Copies the generated frontend distribution into the root `dist/` directory.
3. Prepares the application to be served by the root Node.js runtime.

---

# Prisma and Database

The canonical Prisma schema and migrations are located under:

```text
backend/prisma/
```

Useful commands:

```bash
cd backend

npm run prisma:generate
npm run prisma:validate
```

For local migration review:

```bash
npx prisma migrate status --schema prisma/schema.prisma
```

Database migrations must be reviewed before being applied to shared databases.

**Do not run migration commands against a shared Neon or production database without explicit database-owner approval.**

---

# Local Seed Data

The repository contains local-development seed scripts under:

```text
backend/prisma/
```

Seeding is intended only for disposable/local development environments.

Never run seed scripts against:

* Production
* Shared staging databases
* Shared development databases

Use local credentials and local database data when performing seed-based testing.

---

# API and Workflow Reference

The detailed API contract, role matrix, environment policy, state transitions, seed policy, and integration checklist are maintained in:

```text
INTEGRATION.md
```

Important API areas include:

```text
/api/auth
/api/complaints
/api/approvals
/api/tickets
/api/jobs
/api/verifications
```

The backend is the authoritative source for role-based access control and workflow enforcement.

---

# Manual Workflow Smoke Test

Use a disposable/local development database and local test accounts.

### Step 1 — Supervisor

Login as:

```text
SUPERVISOR
```

Create a repair complaint.

Expected initial status:

```text
COMPLAINT_REGISTERED
```

### Step 2 — HOD

Login as:

```text
HOD
```

Open pending approvals and approve the complaint.

### Step 3 — Assignment Role

Login as an authorized assignment role:

```text
ELECTRICIAN_INCHARGE
ELECTRICIAN_HEAD
MANAGER
```

Open the assignment-ready complaints and assign an electrician.

Expected complaint status:

```text
REPAIR_ASSIGNED
```

### Step 4 — Electrician

Login as the assigned:

```text
ELECTRICIAN
```

Confirm that the assigned job is visible.

Update the job through:

```text
IN_PROGRESS
```

and then:

```text
COMPLETED
```

Submit the action-taken report.

Expected complaint status:

```text
ACTION_TAKEN
```

### Step 5 — Verification

Login as an authorized verifier.

Verify the repair.

Expected status:

```text
VERIFICATION
```

### Step 6 — Closure

After successful verification, close the complaint.

Expected final status:

```text
CLOSED
```

---

# Continuous Integration

GitHub Actions is configured under:

```text
.github/workflows/ci.yml
```

CI runs for pushes and pull requests targeting:

```text
main
backend-dev
frontend-dev
database-dev
```

The backend CI checks include:

```bash
npm ci
npm run prisma:generate
npm run prisma:validate
npm run lint
npm test
npm run build
```

The frontend CI checks include:

```bash
npm ci
npm run lint
npm test
npm run build
```

CI uses safe test configuration values. Real production credentials must never be placed inside the workflow file.

---

# Branch and Pull Request Workflow

Do not push feature work directly to `main`.

Use the appropriate development branch:

| Work Area             | Target Development Branch       |
| --------------------- | ------------------------------- |
| Backend               | `backend-dev`                   |
| Frontend              | `frontend-dev`                  |
| Database              | `database-dev`                  |
| Cross-cutting changes | Review with all affected owners |

## Recommended Workflow

Create a feature branch from the appropriate development branch:

```bash
git checkout <development-branch>
git pull origin <development-branch>
git checkout -b <team>/<short-description>
```

Example:

```bash
git checkout frontend-dev
git pull origin frontend-dev
git checkout -b frontend/update-documentation
```

Make the required changes, then check:

```bash
git status
git diff
git diff --check
```

Commit the changes:

```bash
git add .
git commit -m "docs: update workflow and deployment guide"
```

Push the branch:

```bash
git push -u origin <your-branch-name>
```

Then open a Pull Request.

### Pull Request Rules

* Target the correct development branch.
* Do not bypass required review.
* Ensure CI checks pass.
* Keep the PR focused on the assigned issue.
* Do not include secrets or local environment files.
* Request review from the relevant team members.
* Cross-cutting changes should be reviewed by all affected owners.

---

# Deployment

The repository currently does not contain a platform-specific deployment configuration such as Docker, Render, Railway, Vercel, Netlify, or Fly.io configuration.

Therefore deployment should be performed using the following general Node.js procedure on an approved hosting environment.

## 1. Prepare the Application

Clone the approved repository version:

```bash
git clone https://github.com/midhilesh38/main-project1.git
cd main-project1
```

Install dependencies:

```bash
npm install
```

## 2. Configure Deployment Environment Variables

Configure the required environment variables through the hosting provider's secret/environment-variable settings:

```text
DATABASE_URL
JWT_SECRET
PORT
```

If the frontend is deployed separately, configure:

```text
VITE_API_BASE_URL
```

Do not commit these values to Git.

## 3. Build

Run:

```bash
npm run build
```

## 4. Start

Run:

```bash
npm start
```

The root runtime uses:

```text
server.js
```

and serves the built frontend together with the backend application when the frontend distribution is available.

## 5. Verify Deployment

After deployment:

1. Confirm the server starts successfully.
2. Confirm the configured port is accessible.
3. Open the application in a browser.
4. Verify that the frontend loads.
5. Verify that API requests reach the backend.
6. Test authentication.
7. Perform a basic repair-ticket workflow using safe test data.

---

# Security Guidelines

## Environment Files

Never commit:

```text
.env
.env.local
.env.*.local
```

Use:

```text
.env.example
```

for variable names and safe placeholders only.

## Credentials

Never place the following in documentation, source code, commits, or screenshots:

* Real passwords
* Database credentials
* JWT secrets
* API keys
* Access tokens
* Private credentials

## Database Safety

Use a disposable/local database for development and testing whenever possible.

Do not perform destructive or migration operations on shared or production databases without authorization.

---

# Known Limitations and Audit Findings

The following items were identified during project inspection and previous frontend workflow validation.

### 1. Root test script needs correction

The root `package.json` currently contains a formatting/command issue in the frontend portion of the root test script.

The configured command is:

```text
npm--workspace=frontend run test
```

There is a missing space between `npm` and `--workspace`.

This should be addressed as a separate code-maintenance fix rather than silently changing the documentation task.

### 2. Root server contains a JWT fallback

The root `server.js` currently contains a fallback JWT secret when `JWT_SECRET` is not supplied.

This is a security concern because production authentication should use an explicitly configured secret rather than a hard-coded fallback.

A separate security fix should remove the fallback and require `JWT_SECRET` to be supplied through the deployment environment.

The actual secret value is intentionally not documented here.

### 3. No platform-specific deployment configuration

The repository currently does not provide deployment files for a specific hosting platform.

The deployment section above therefore describes the verified generic Node.js build/start process rather than claiming support for a particular hosting provider.

### 4. Documentation and implementation must remain synchronized

The canonical workflow is currently documented as:

```text
COMPLAINT_REGISTERED
→ REPAIR_ASSIGNED
→ ACTION_TAKEN
→ VERIFICATION
→ CLOSED
```

`OVERDUE` and `ESCALATED` are exception states.

Any future workflow changes should update both the implementation and the relevant documentation.

### 5. Manual workflow validation

A previous frontend audit/testing exercise was used to validate the complaint workflow, including:

* Complaint creation
* HOD approval
* Electrician selection and assignment
* Electrician job visibility
* Action-taken workflow
* Verification workflow
* Browser-side validation

The screenshots from that earlier audit can be retained as **previous validation evidence** where required. They should not be presented as newly captured specifically for this documentation issue.

---

# Pre-Merge Checklist

Before opening or merging a Pull Request, verify:

* [ ] README/documentation is updated.
* [ ] Workflow statuses match the current shared status model.
* [ ] Local frontend setup is documented.
* [ ] Local backend setup is documented.
* [ ] Environment variable names are documented.
* [ ] No secret values are documented.
* [ ] Test commands are documented.
* [ ] Lint commands are documented.
* [ ] Build commands are documented.
* [ ] Branch and Pull Request workflow is documented.
* [ ] Deployment procedure is documented without inventing unsupported platform configuration.
* [ ] Known limitations and audit findings are documented.
* [ ] `git diff --check` passes.
* [ ] CI checks pass.
* [ ] No `.env` files are committed.
* [ ] The Pull Request has the required review.

---

# Related Documentation

For the detailed integration contract, API definitions, role permissions, database policy, seed policy, state transitions, and integration checklist, see:

```text
INTEGRATION.md
```

---

## Quick Command Reference

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run lint
npm test
npm run build
```

### Backend

```bash
cd backend
npm install
npm run dev
npm run lint
npm test
npm run build
npm run prisma:generate
npm run prisma:validate
```

### Root

```bash
npm install
npm run dev
npm run build
npm start
npm run lint
npm test
```

---

## Contribution Summary

The safest contribution flow is:

```text
Development Branch
       ↓
Feature/Task Branch
       ↓
Make Changes
       ↓
Run Tests + Lint + Build
       ↓
Check for Secrets
       ↓
Commit
       ↓
Push Branch
       ↓
Pull Request
       ↓
Review + CI
       ↓
Merge
```

Keep documentation, implementation, workflow statuses, and deployment instructions synchronized as the project evolves.
