-- Issue #33: Consolidated database changes
-- Adds support for Comments, Cancellation Requests,
-- Edit Requests, SLA Configuration, and Deadline Extension History.

-- =========================================================
-- 1. Attachment uploader relationship
-- =========================================================

ALTER TABLE "Attachment"
ADD COLUMN "uploadedById" TEXT;

-- =========================================================
-- 2. Comment
-- =========================================================

CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- =========================================================
-- 3. CancellationRequest
-- =========================================================

CREATE TABLE "CancellationRequest" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CancellationRequest_pkey" PRIMARY KEY ("id")
);

-- =========================================================
-- 4. EditRequest
-- =========================================================

CREATE TABLE "EditRequest" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "requestedChanges" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "reviewedById" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "reviewRemarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EditRequest_pkey" PRIMARY KEY ("id")
);

-- =========================================================
-- 5. SLAConfiguration
-- =========================================================

CREATE TABLE "SLAConfiguration" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT,
    "slaDays" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SLAConfiguration_pkey" PRIMARY KEY ("id")
);

-- =========================================================
-- 6. DeadlineExtension
-- =========================================================

CREATE TABLE "DeadlineExtension" (
    "id" TEXT NOT NULL,
    "complaintId" TEXT NOT NULL,
    "requestedById" TEXT NOT NULL,
    "previousDueAt" TIMESTAMP(3) NOT NULL,
    "newDueAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approvedById" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DeadlineExtension_pkey" PRIMARY KEY ("id")
);

-- =========================================================
-- 7. Foreign keys
-- =========================================================

ALTER TABLE "Attachment"
ADD CONSTRAINT "Attachment_uploadedById_fkey"
FOREIGN KEY ("uploadedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_complaintId_fkey"
FOREIGN KEY ("complaintId")
REFERENCES "Complaint"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "Comment"
ADD CONSTRAINT "Comment_userId_fkey"
FOREIGN KEY ("userId")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "CancellationRequest"
ADD CONSTRAINT "CancellationRequest_complaintId_fkey"
FOREIGN KEY ("complaintId")
REFERENCES "Complaint"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "CancellationRequest"
ADD CONSTRAINT "CancellationRequest_requestedById_fkey"
FOREIGN KEY ("requestedById")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "CancellationRequest"
ADD CONSTRAINT "CancellationRequest_reviewedById_fkey"
FOREIGN KEY ("reviewedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "EditRequest"
ADD CONSTRAINT "EditRequest_complaintId_fkey"
FOREIGN KEY ("complaintId")
REFERENCES "Complaint"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "EditRequest"
ADD CONSTRAINT "EditRequest_requestedById_fkey"
FOREIGN KEY ("requestedById")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "EditRequest"
ADD CONSTRAINT "EditRequest_reviewedById_fkey"
FOREIGN KEY ("reviewedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "SLAConfiguration"
ADD CONSTRAINT "SLAConfiguration_departmentId_fkey"
FOREIGN KEY ("departmentId")
REFERENCES "Department"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

ALTER TABLE "DeadlineExtension"
ADD CONSTRAINT "DeadlineExtension_complaintId_fkey"
FOREIGN KEY ("complaintId")
REFERENCES "Complaint"("id")
ON DELETE CASCADE
ON UPDATE CASCADE;

ALTER TABLE "DeadlineExtension"
ADD CONSTRAINT "DeadlineExtension_requestedById_fkey"
FOREIGN KEY ("requestedById")
REFERENCES "User"("id")
ON DELETE RESTRICT
ON UPDATE CASCADE;

ALTER TABLE "DeadlineExtension"
ADD CONSTRAINT "DeadlineExtension_approvedById_fkey"
FOREIGN KEY ("approvedById")
REFERENCES "User"("id")
ON DELETE SET NULL
ON UPDATE CASCADE;

