const prisma = require('../config/db');

const ACTIVE_ASSIGNMENT_STATUSES = ['ASSIGNED', 'IN_PROGRESS'];
const ASSIGNMENT_ROLES = [
  'SUPERVISOR',
  'HOD',
  'ELECTRICIAN_INCHARGE',
  'ELECTRICIAN_HEAD',
  'MANAGER',
  'DEAN_IQAC',
];

const toTicketResponse = (complaint, assignment = null) => ({
  id: complaint.id,
  complaintId: complaint.id,
  ticketNumber: complaint.ticketNumber,
  status: assignment ? assignment.status : 'OPEN',
  complaint,
  assignment,
});

const getElectricians = async (req, res) => {
  try {
    const electricians = await prisma.user.findMany({
      where: {
        role: 'ELECTRICIAN',
        isActive: true,
      },
      select: {
        id: true,
        employeeId: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        departmentId: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      count: electricians.length,
      electricians,
    });
  } catch (error) {
    console.error('Get electricians error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch electricians',
    });
  }
};

const getUnassignedTickets = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        hodApprovalStatus: 'APPROVED',
        assignments: {
          none: {
            status: {
              in: ACTIVE_ASSIGNMENT_STATUSES,
            },
          },
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
      },
      orderBy: {
        hodApprovedAt: 'asc',
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      tickets: complaints.map((complaint) => toTicketResponse(complaint)),
    });
  } catch (error) {
    console.error('Get unassigned tickets error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch unassigned tickets',
    });
  }
};

const openTicket = async (req, res) => {
  try {
    const { complaintId } = req.params;

    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
      include: {
        assignments: {
          where: {
            status: {
              in: ACTIVE_ASSIGNMENT_STATUSES,
            },
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

    if (complaint.hodApprovalStatus !== 'APPROVED') {
      return res.status(400).json({
        success: false,
        message: 'Only HOD-approved complaints can be opened for assignment',
      });
    }

    if (complaint.assignments.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Complaint already has an active assignment',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Complaint is ready for electrician assignment',
      ticket: toTicketResponse(complaint),
    });
  } catch (error) {
    console.error('Open ticket error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to open ticket',
    });
  }
};

const assignElectrician = async (req, res) => {
  try {
    const { id: complaintId } = req.params;
    const { electricianId, remarks } = req.body;
    const assignedById = req.user.id;

    if (!electricianId || typeof electricianId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'electricianId is required',
      });
    }

    const result = await prisma.$transaction(async (tx) => {
      const electrician = await tx.user.findUnique({
        where: { id: electricianId },
        select: {
          id: true,
          employeeId: true,
          username: true,
          fullName: true,
          role: true,
          isActive: true,
        },
      });

      if (!electrician) {
        return {
          statusCode: 404,
          body: {
            success: false,
            message: 'Electrician not found',
          },
        };
      }

      if (electrician.role !== 'ELECTRICIAN' || !electrician.isActive) {
        return {
          statusCode: 400,
          body: {
            success: false,
            message: 'Selected user must be an active ELECTRICIAN',
          },
        };
      }

      const complaint = await tx.complaint.findUnique({
        where: { id: complaintId },
        include: {
          assignments: {
            where: {
              status: {
                in: ACTIVE_ASSIGNMENT_STATUSES,
              },
            },
          },
        },
      });

      if (!complaint) {
        return {
          statusCode: 404,
          body: {
            success: false,
            message: 'Complaint not found',
          },
        };
      }

      if (complaint.hodApprovalStatus !== 'APPROVED') {
        return {
          statusCode: 400,
          body: {
            success: false,
            message: 'Only HOD-approved complaints can be assigned',
          },
        };
      }

      if (complaint.assignments.length > 0) {
        return {
          statusCode: 409,
          body: {
            success: false,
            message: 'Complaint already has an active assignment',
          },
        };
      }

      const assignment = await tx.assignment.create({
        data: {
          complaintId,
          technicianId: electrician.id,
          assignedById,
          remarks: remarks || null,
        },
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
          complaint: true,
        },
      });

      const updatedComplaint = await tx.complaint.update({
        where: { id: complaintId },
        data: {
          status: 'REPAIR_ASSIGNED',
          lastUpdatedAt: new Date(),
        },
      });

      await tx.complaintStatusHistory.create({
        data: {
          complaintId,
          status: 'REPAIR_ASSIGNED',
          remarks: remarks || 'Electrician assigned',
          changedById: assignedById,
        },
      });

      return {
        statusCode: 200,
        body: {
          success: true,
          message: 'Electrician assigned successfully',
          ticket: toTicketResponse(updatedComplaint, assignment),
          assignment,
        },
      };
    });

    return res.status(result.statusCode).json(result.body);
  } catch (error) {
    console.error('Assign electrician error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to assign electrician',
    });
  }
};

const getAllocatedTickets = async (req, res) => {
  try {
    const assignments = await prisma.assignment.findMany({
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
                    employeeId: true,
                    fullName: true,
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
                employeeId: true,
                fullName: true,
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
            email: true,
            phone: true,
            role: true,
          },
        },
        assignedBy: {
          select: {
            id: true,
            employeeId: true,
            fullName: true,
            role: true,
          },
        },
      },
      orderBy: {
        assignedAt: 'desc',
      },
    });

    return res.status(200).json({
      success: true,
      count: assignments.length,
      assignments,
      allocatedTickets: assignments,
    });
  } catch (error) {
    console.error('Get allocated tickets error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch allocated tickets',
    });
  }
};

module.exports = {
  ASSIGNMENT_ROLES,
  getElectricians,
  getUnassignedTickets,
  getAllocatedTickets,
  openTicket,
  assignElectrician,
};
