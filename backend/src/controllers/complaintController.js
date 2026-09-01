const prisma = require('../config/db');

const getComplaints = async (req, res) => {
  try {
    const where = {};
    if (req.query.my === 'true' || req.query.scope === 'my' || req.query.reporterId) {
      where.reporterId = req.query.reporterId || req.user.id;
    }

    const complaints = await prisma.complaint.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      orderBy: {
        createdAt: 'desc',
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
                phone: true,
              },
            },
          },
        },
        atrs: true,
        verifications: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get complaints error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaints',
    });
  }
};

const getMyComplaints = async (req, res) => {
  try {
    const complaints = await prisma.complaint.findMany({
      where: {
        reporterId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
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
                phone: true,
              },
            },
          },
        },
        atrs: true,
        verifications: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    console.error('Get my complaints error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch your complaints',
    });
  }
};

const getComplaintById = async (req, res) => {
  try {
    const complaint = await prisma.complaint.findUnique({
      where: { id: req.params.id },
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
        },
        atrs: true,
        verifications: true,
        statusHistory: {
          orderBy: {
            changedAt: 'desc',
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

    return res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    console.error('Get complaint by id error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch complaint',
    });
  }
};

const createComplaint = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      priority,
      departmentId,
      equipmentId,
      slaDueAt,
      locationBuilding,
      floorArea,
      roomAreaNumber,
      requesterContact,
      contactPhone,
      locationIntercom,
    } = req.body;
    const reporterId = req.user.id;

    if (!title || !description || !category || !slaDueAt) {
      return res.status(400).json({
        status: 'error',
        message: 'title, description, category and slaDueAt are required',
      });
    }

    const slaDate = new Date(slaDueAt);
    if (isNaN(slaDate.getTime())) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid SLA date format',
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    
    let targetTime = slaDate.getTime();
    if (typeof slaDueAt === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(slaDueAt.trim())) {
      const [year, month, day] = slaDueAt.trim().split('-').map(Number);
      targetTime = new Date(year, month - 1, day).getTime();
    }

    if (targetTime < todayStart) {
      return res.status(400).json({
        status: 'error',
        message: 'Target SLA resolution date cannot be earlier than the current date',
      });
    }

    const ticketNumber = `CMP-${Date.now()}`;

    const complaint = await prisma.complaint.create({
      data: {
        ticketNumber,
        title,
        description,
        category,
        priority: priority || 'MEDIUM',
        reporterId,
        departmentId: departmentId || null,
        equipmentId: equipmentId || null,
        locationBuilding: locationBuilding || null,
        floorArea: floorArea || null,
        roomAreaNumber: roomAreaNumber || null,
        requesterContact: requesterContact || contactPhone || null,
        locationIntercom: locationIntercom || null,
        slaDueAt: new Date(slaDueAt),
      },
    });

    return res.status(201).json({
      success: true,
      status: 'success',
      message: 'Complaint created successfully',
      complaint,
      data: complaint,
    });
  } catch (error) {
    console.error('Create complaint error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to create complaint',
      error: error.message,
    });
  }
};

module.exports = {
  getComplaints,
  getMyComplaints,
  getComplaintById,
  createComplaint,
};
