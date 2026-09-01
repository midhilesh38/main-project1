const prisma = require('../config/db');

// GET /api/approvals/pending
// HOD only
exports.getPendingApprovals = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        hodApprovalStatus: 'PENDING',
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get Pending Approvals Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending approvals.',
    });
  }
};

// GET /api/approvals/history
// HOD only: retrieve approved / processed history and tracking for departmental complaints
exports.getApprovalHistory = async (req, res) => {
  try {
    const hodId = req.user.id;
    const departmentId = req.user.departmentId;

    const complaints = await prisma.complaint.findMany({
      where: {
        OR: [
          { hodApprovedById: hodId },
          { hodApprovalStatus: { in: ['APPROVED', 'REJECTED'] } },
          ...(departmentId ? [{ departmentId }] : []),
        ],
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
        equipment: true,
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
          orderBy: {
            assignedAt: 'desc',
          },
        },
        atrs: {
          include: {
            submittedBy: {
              select: {
                id: true,
                fullName: true,
                employeeId: true,
              },
            },
          },
          orderBy: {
            submittedAt: 'desc',
          },
        },
        verifications: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
        hodApprovedBy: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
          },
        },
      },
      orderBy: {
        lastUpdatedAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get Approval History Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch approval history.',
    });
  }
};

// PATCH /api/approvals/:id
// HOD only
exports.updateApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason } = req.body;

    // Validate status
    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or REJECTED.',
      });
    }

    // Rejection requires a reason
    if (
      status === 'REJECTED' &&
      (!rejectionReason || !rejectionReason.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting a complaint.',
      });
    }

    // Find complaint
    const complaint = await prisma.complaint.findUnique({
      where: { id },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Only pending complaints can be approved/rejected
    if (complaint.hodApprovalStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'This complaint has already been processed.',
      });
    }

    // Update approval
    const updatedComplaint = await prisma.complaint.update({
      where: { id },
      data: {
        hodApprovalStatus: status,
        hodApprovedById: req.user.id,
        hodApprovedAt: new Date(),
        hodRemarks:
          status === 'REJECTED'
            ? rejectionReason.trim()
            : (req.body.remarks || req.body.hodRemarks || null),
      },
    });

    return res.status(200).json({
      success: true,
      message:
        status === 'APPROVED'
          ? 'Complaint approved successfully.'
          : 'Complaint rejected successfully.',
      complaint: updatedComplaint,
    });

  } catch (error) {
    console.error('Update Approval Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update complaint approval.',
    });
  }
};

// GET /api/approvals/action-reports/pending
// HOD only
exports.getPendingActionReportApprovals = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        status: 'ACTION_TAKEN',
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
    console.error('Get Pending Action Report Approvals Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch pending action-taken report approvals.',
    });
  }
};

// PATCH /api/approvals/action-reports/:id
// HOD only
exports.updateActionReportApproval = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks, rejectionReason } = req.body;
    const hodId = req.user.id;

    if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Status must be either APPROVED or REJECTED.',
      });
    }

    const reason = (rejectionReason || remarks || '').trim();
    if (status === 'REJECTED' && !reason) {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required when rejecting an action-taken report.',
      });
    }

    const complaint = await prisma.complaint.findUnique({
      where: { id },
      include: {
        atrs: true,
        assignments: true,
      },
    });

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found.',
      });
    }

    // Check if ATR exists or if complaint is in ACTION_TAKEN status
    let atrs = complaint.atrs || [];
    if (atrs.length === 0 && prisma.actionTakenReport?.findMany) {
      atrs = await prisma.actionTakenReport.findMany({
        where: { complaintId: id },
      });
    }

    if (complaint.status !== 'ACTION_TAKEN' && atrs.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'This complaint does not have an action-taken report awaiting HOD approval.',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const now = new Date();
      // When HOD endorses ATR, ticket status updates to CLOSED
      const newStatus = status === 'APPROVED' ? 'CLOSED' : 'REPAIR_ASSIGNED';

      const updatedComplaint = await tx.complaint.update({
        where: { id },
        data: {
          status: newStatus,
          lastUpdatedAt: now,
          ...(status === 'APPROVED'
            ? {
                closedAt: now,
                verifiedAt: now,
                resolvedAt: complaint.resolvedAt || now,
              }
            : {}),
        },
      });

      if (status === 'APPROVED' && tx.verification) {
        await tx.verification.create({
          data: {
            complaintId: id,
            verifierId: hodId,
            isVerified: true,
            remarks: remarks || 'HOD endorsed ATR and closed ticket',
          },
        });
      }

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: id,
          status: newStatus,
          remarks:
            status === 'APPROVED'
              ? (remarks || 'HOD endorsed Action Taken Report and closed ticket.')
              : (reason || 'Action-taken report rejected. Ticket sent back for rework.'),
          changedById: hodId,
        },
      });

      return updatedComplaint;
    });

    return res.status(200).json({
      success: true,
      message:
        status === 'APPROVED'
          ? 'Action-taken report endorsed successfully. Ticket is now closed.'
          : 'Action-taken report rejected. Ticket sent back for rework.',
      complaint: result,
    });
  } catch (error) {
    console.error('Update Action Report Approval Error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update action-taken report approval.',
    });
  }
};

