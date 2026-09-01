# PEC Repair Complaint Management System Integration Guide

## Canonical Ownership

- Backend application: `backend/src`
- Backend runtime entrypoint: `backend/src/server.js`
- Express app factory for tests: `backend/src/app.js`
- Prisma schema and migrations: `backend/prisma`
- Frontend application: `frontend`
- CI workflows: `.github/workflows`

There must be no second runnable Express app at repository root. Root-level Prisma schemas or generated clients must not be reintroduced.

## Branch Responsibilities

- Backend work branches should target `backend-dev`.
- Frontend work branches should target `frontend-dev`.
- Database/schema work branches should target `database-dev`.
- Cross-cutting integration branches should be reviewed by all affected owners before merging toward `main`.

## Environment Policy

Use local `.env` files copied from `.env.example`. Never commit real `DATABASE_URL`, `JWT_SECRET`, API keys, passwords, or tokens.

Required backend variables:

```bash
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE?sslmode=require"
JWT_SECRET="a-long-random-secret"
PORT=5000
```

Required frontend variables:

```bash
VITE_API_BASE_URL="http://localhost:5000"
```

## Final API Contract

| Feature | Method/path | Body | Roles | Response |
|---|---|---|---|---|
| Login | `POST /api/auth/login` | `{ username, password }` | Public | `{ message, token, user }` |
| Current user | `GET /api/auth/me` | none | Authenticated | `{ success, user }` |
| Create complaint | `POST /api/complaints` | `{ title, description, category, priority?, departmentId?, equipmentId?, slaDueAt }` | `SUPERVISOR` | `{ status, message, data }` |
| List complaints | `GET /api/complaints` | none | `SUPERVISOR`, `HOD`, `ELECTRICIAN_INCHARGE`, `ELECTRICIAN_HEAD`, `MANAGER`, `DEAN_IQAC` | `{ success, count, complaints }` |
| Complaint detail | `GET /api/complaints/:id` | none | Same as list | `{ success, complaint }` |
| Pending approvals | `GET /api/approvals/pending` | none | `HOD` | `{ success, count, complaints }` |
| Approve/reject | `PATCH /api/approvals/:id` | `{ status: "APPROVED" \| "REJECTED", rejectionReason? }` | `HOD` | `{ success, message, complaint }` |
| Assignment-ready complaints | `GET /api/tickets/unassigned` | none | `SUPERVISOR`, `HOD`, `ELECTRICIAN_INCHARGE`, `ELECTRICIAN_HEAD`, `MANAGER` | `{ success, count, tickets }` |
| Electrician lookup | `GET /api/tickets/electricians` | none | Same as assignment-ready | `{ success, count, electricians }` |
| Open approved complaint | `POST /api/tickets/open/:complaintId` | none | Same as assignment-ready | `{ success, message, ticket }` |
| Assign electrician | `PATCH /api/tickets/:id/assign-electrician` | `{ electricianId, remarks? }` | Same as assignment-ready | `{ success, message, ticket, assignment }` |
| My jobs | `GET /api/jobs` | none | `ELECTRICIAN` | `{ success, count, jobs }` |
| Update job status | `PATCH /api/jobs/:id/status` | `{ status: "IN_PROGRESS" \| "COMPLETED", remarks? }` | Assigned `ELECTRICIAN` only | `{ success, message, job }` |
| Action-taken report | `POST /api/jobs/:id/action-taken` | `{ actionTaken, partsUsed?, remarks? }` | Assigned `ELECTRICIAN` only | `{ success, message, report }` |
| Verify repair | `POST /api/verifications/:complaintId` | `{ isVerified, remarks? }` | `ELECTRICIAN_INCHARGE`, `ELECTRICIAN_HEAD`, `MANAGER` | `{ success, message, verification, complaint }` |
| Close complaint | `POST /api/verifications/:complaintId/close` | `{ remarks? }` | Same as verifier | `{ success, message, complaint }` |

JWT logout is client-side token removal. The frontend must not call a server logout route unless token revocation is later designed and implemented.

## Roles and Permissions

| Role | Permissions |
|---|---|
| `SUPERVISOR` | Create complaints; view complaints; view and assign approved unassigned work. |
| `HOD` | View pending approvals; approve/reject once; view complaints; participate in assignment. |
| `ELECTRICIAN_INCHARGE` | Assignment, verification, and closure. |
| `ELECTRICIAN_HEAD` | Assignment, verification, and closure. |
| `MANAGER` | Assignment, verification, and closure. |
| `ELECTRICIAN` | View only own jobs; update own assignment status; submit own action-taken reports. |
| `DEAN_IQAC` | Read complaint list/detail only. |

Backend RBAC is authoritative. Frontend visibility is convenience only.

## State Transitions

Complaint lifecycle:

```text
COMPLAINT_REGISTERED
  -> REPAIR_ASSIGNED
  -> ACTION_TAKEN
  -> VERIFICATION
  -> CLOSED
```

Approval lifecycle:

```text
PENDING -> APPROVED
PENDING -> REJECTED
```

Assignment lifecycle:

```text
ASSIGNED -> IN_PROGRESS -> COMPLETED
```

Closure is blocked until a completed assignment and successful verification exist.

## Prisma and Migration Policy

`backend/prisma/schema.prisma` and `backend/prisma/migrations` are canonical. Migrations copied into this folder preserve tracked migration history for review, but they have not been applied by this integration work.

Safe validation commands:

```bash
cd backend
DATABASE_URL="postgresql://user:pass@localhost:5432/pec_test" npm run prisma:validate
DATABASE_URL="postgresql://user:pass@localhost:5432/pec_test" npm run prisma:generate
```

Human database lead review against a disposable/local database:

```bash
cd backend
npx prisma migrate status --schema prisma/schema.prisma
npx prisma migrate dev --schema prisma/schema.prisma --name reviewed_local_integration
```

Do not run migration commands against shared Neon without explicit database lead approval.

## Seed Policy

`backend/prisma/seed.js` is local-development-only and refuses to run unless:

```bash
ALLOW_LOCAL_DEV_SEED="I_UNDERSTAND_THIS_SEEDS_ONLY_LOCAL_DEV"
```

Never run seed scripts against shared, staging, or production databases. Override demo passwords with `SEED_*_PASSWORD` variables for disposable local runs.

## Required Checks Before Merge

```bash
cd backend
npm ci
DATABASE_URL="postgresql://user:pass@localhost:5432/pec_test" npm run prisma:generate
DATABASE_URL="postgresql://user:pass@localhost:5432/pec_test" npm run prisma:validate
npm run lint
npm test
npm run build

cd ../frontend
npm ci
VITE_API_BASE_URL="http://localhost:5000" npm run lint
VITE_API_BASE_URL="http://localhost:5000" npm test
VITE_API_BASE_URL="http://localhost:5000" npm run build
```

## Manual Workflow Smoke Test

Use a disposable/local database with seeded local accounts only.

1. Login as `SUPERVISOR`.
2. Create a complaint.
3. Login as `HOD`.
4. View pending approvals and approve the complaint.
5. Login as `ELECTRICIAN_HEAD` or `MANAGER`.
6. View assignment-ready complaints and active electricians.
7. Assign an electrician.
8. Login as assigned `ELECTRICIAN`.
9. Confirm only that electrician's jobs appear.
10. Mark job `IN_PROGRESS`, then `COMPLETED`.
11. Submit action-taken report.
12. Login as verifier role.
13. Verify repair and close complaint.

## Ready-for-Main Checklist

- CI is green on the integration branch.
- Database lead reviewed Prisma schema and migration SQL.
- Disposable/local database workflow smoke test passed.
- No secrets are committed.
- Dependency audit findings are triaged.
- PR targets and reviewer ownership are explicit.
