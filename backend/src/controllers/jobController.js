const prisma = require('../config/db');

const getJobs = async (req, res) => {
  try {
    const technicianId = req.user.id;

    const jobs = await prisma.assignment.findMany({
      where: {
        technicianId,
      },
      orderBy: {
        assignedAt: 'desc',
      },
      include: {
        complaint: {
          include: {
            reporter: {
              select: {
                id: true,
                employeeId: true,
                username: true,
                fullName: true,
                email: true,
                phone: true,
              },
            },
            department: true,
            equipment: true,
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
          },
        },
        technician: {
          select: {
            id: true,
            employeeId: true,
            username: true,
            fullName: true,
            role: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            fullName: true,
            employeeId: true,
            role: true,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: jobs.length,
      jobs,
    });
  } catch (error) {
    console.error('Get jobs error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch jobs',
    });
  }
};

const updateJobStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    const technicianId = req.user.id;

    const validTransitions = {
      ASSIGNED: ['IN_PROGRESS'],
      IN_PROGRESS: ['COMPLETED'],
      COMPLETED: [],
      REASSIGNED: ['IN_PROGRESS'],
    };

    if (!status || !['IN_PROGRESS', 'COMPLETED'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be IN_PROGRESS or COMPLETED',
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        complaint: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (assignment.technicianId !== technicianId) {
      return res.status(403).json({
        success: false,
        message: 'You can update only your own jobs',
      });
    }

    if (!validTransitions[assignment.status].includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid transition from ${assignment.status} to ${status}`,
      });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const now = new Date();
      const updatedAssignment = await tx.assignment.update({
        where: { id },
        data: {
          status,
          remarks: remarks || assignment.remarks,
          ...(status === 'IN_PROGRESS' ? { startedAt: now } : {}),
          ...(status === 'COMPLETED' ? { completedAt: now } : {}),
        },
        include: {
          complaint: true,
        },
      });

      const complaintStatus = status === 'IN_PROGRESS' ? 'REPAIR_ASSIGNED' : 'ACTION_TAKEN';

      await tx.complaint.update({
        where: { id: assignment.complaintId },
        data: {
          status: complaintStatus,
          lastUpdatedAt: now,
          ...(status === 'COMPLETED' ? { resolvedAt: now } : {}),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: assignment.complaintId,
          status: complaintStatus,
          remarks: remarks || `Assignment marked ${status}`,
          changedById: technicianId,
        },
      });

      return updatedAssignment;
    });

    return res.status(200).json({
      success: true,
      message: 'Job status updated successfully',
      job: updated,
    });
  } catch (error) {
    console.error('Update job status error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to update job status',
    });
  }
};

const submitActionTakenReport = async (req, res) => {
  try {
    const { id } = req.params;
    const { actionTaken, partsUsed, remarks } = req.body;
    const technicianId = req.user.id;

    if (!actionTaken || !actionTaken.trim()) {
      return res.status(400).json({
        success: false,
        message: 'actionTaken is required',
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id },
      include: {
        complaint: true,
      },
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: 'Job not found',
      });
    }

    if (assignment.technicianId !== technicianId) {
      return res.status(403).json({
        success: false,
        message: 'You can submit reports only for your own jobs',
      });
    }

    if (assignment.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Action-taken report can be submitted only after the assignment is completed',
      });
    }

    const report = await prisma.$transaction(async (tx) => {
      const atr = await tx.actionTakenReport.create({
        data: {
          complaintId: assignment.complaintId,
          submittedById: technicianId,
          actionTaken: actionTaken.trim(),
          partsUsed: partsUsed || null,
          remarks: remarks || null,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: assignment.complaintId },
        data: {
          status: 'ACTION_TAKEN',
          lastUpdatedAt: new Date(),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId: assignment.complaintId,
          status: 'ACTION_TAKEN',
          remarks: remarks || 'Action-taken report submitted',
          changedById: technicianId,
        },
      });

      return { atr, complaint: updatedComplaint };
    });

    return res.status(201).json({
      success: true,
      message: 'Action-taken report submitted successfully',
      report: report.atr,
      atr: report.atr,
      complaint: report.complaint,
    });
  } catch (error) {
    console.error('Submit action taken report error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to submit action-taken report',
    });
  }
};

module.exports = {
  getJobs,
  updateJobStatus,
  submitActionTakenReport,
};
