const prisma = require('../config/db');

const VERIFIER_ROLES = [
  'HOD',
  'SUPERVISOR',
  'ELECTRICIAN_INCHARGE',
  'ELECTRICIAN_HEAD',
  'MANAGER',
  'DEAN_IQAC',
];

// GET /api/verifications/pending
// List complaints awaiting verification / closure
const getPendingVerifications = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        status: {
          in: ['ACTION_TAKEN', 'VERIFICATION'],
        },
      },
      include: {
        reporter: {
          select: {
            id: true,
            employeeId: true,
            username: true,
            fullName: true,
          },
        },
        department: true,
        assignments: {
          include: {
            technician: {
              select: {
                id: true,
                employeeId: true,
                username: true,
                fullName: true,
                role: true,
              },
            },
          },
        },
        atrs: {
          orderBy: {
            submittedAt: 'desc',
          },
        },
        verifications: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
      orderBy: {
        lastUpdatedAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get pending verifications error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending verifications',
    });
  }
};

const verifyComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { isVerified, remarks } = req.body;
    const verifierId = req.user.id;

    if (typeof isVerified !== 'boolean') {
      return res.status(400).json({
        success: false,
        message: 'isVerified must be a boolean',
      });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        assignments: true,
        atrs: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (!complaint.assignments.some((assignment) => assignment.status === 'COMPLETED')) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be verified before a completed assignment exists',
      });
    }

    if (complaint.atrs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be verified before an action-taken report exists',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const verification = await tx.verification.create({
        data: {
          complaintId,
          verifierId,
          isVerified,
          remarks: remarks || null,
        },
      });

      const newStatus = isVerified ? 'VERIFICATION' : 'ACTION_TAKEN';
      const updatedComplaint = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: newStatus,
          verifiedAt: isVerified ? new Date() : null,
          lastUpdatedAt: new Date(),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          status: newStatus,
          remarks: remarks || (isVerified ? 'Repair verified' : 'Repair verification rejected'),
          changedById: verifierId,
        },
      });

      return {
        verification,
        complaint: updatedComplaint,
      };
    });

    return res.status(200).json({
      success: true,
      message: isVerified ? 'Complaint verified successfully' : 'Complaint verification rejected',
      ...result,
    });
  } catch (error) {
    console.error('Verify complaint error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify complaint',
    });
  }
};

const closeComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { remarks } = req.body;
    const closedById = req.user.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        assignments: true,
        verifications: {
          orderBy: {
            verifiedAt: 'desc',
          },
        },
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (complaint.status === 'CLOSED') {
      return res.status(409).json({
        success: false,
        message: 'Complaint is already closed',
      });
    }

    if (!complaint.assignments.some((assignment) => assignment.status === 'COMPLETED')) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be closed before assignment completion',
      });
    }

    if (!complaint.verifications.some((verification) => verification.isVerified)) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be closed before successful verification',
      });
    }

    const updatedComplaint = await prisma.$transaction(async (tx) => {
      const closed = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'CLOSED',
          closedAt: new Date(),
          lastUpdatedAt: new Date(),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          status: 'CLOSED',
          remarks: remarks || 'Complaint closed after verification',
          changedById: closedById,
        },
      });

      return closed;
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint closed successfully',
      complaint: updatedComplaint,
    });
  } catch (error) {
    console.error('Close complaint error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to close complaint',
    });
  }
};

// POST /api/verifications/:complaintId/verify-and-close
// Atomically verify and close complaint in one step
const verifyAndCloseComplaint = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { remarks } = req.body;
    const verifierId = req.user.id;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        assignments: true,
        atrs: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found',
      });
    }

    if (complaint.status === 'CLOSED') {
      return res.status(409).json({
        success: false,
        message: 'Complaint is already closed',
      });
    }

    if (!complaint.assignments.some((assignment) => assignment.status === 'COMPLETED')) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be verified and closed before assignment completion',
      });
    }

    if (complaint.atrs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Complaint cannot be verified and closed before an action-taken report exists',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();

      const verification = await tx.verification.create({
        data: {
          complaintId,
          verifierId,
          isVerified: true,
          remarks: remarks || 'Verified and closed in single step',
          verifiedAt: now,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'CLOSED',
          verifiedAt: now,
          closedAt: now,
          lastUpdatedAt: now,
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          status: 'CLOSED',
          remarks: remarks || 'Complaint verified and closed',
          changedById: verifierId,
        },
      });

      return {
        verification,
        complaint: updatedComplaint,
      };
    });

    return res.status(200).json({
      success: true,
      message: 'Complaint verified and closed successfully',
      ...result,
    });
  } catch (error) {
    console.error('Verify and close complaint error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to verify and close complaint',
    });
  }
};

module.exports = {
  VERIFIER_ROLES,
  getPendingVerifications,
  verifyComplaint,
  closeComplaint,
  verifyAndCloseComplaint,
};

