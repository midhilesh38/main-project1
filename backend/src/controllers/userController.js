const prisma = require('../config/db');

const getElectricians = async (req, res) => {
  try {
    const electricians = await prisma.user.findMany({
      where: {
        role: 'ELECTRICIAN',
        isActive: true,
      },
      orderBy: {
        fullName: 'asc',
      },
    });

    return res.json({
      success: true,
      electricians,
    });
  } catch (error) {
    console.error('Get electricians error:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch electricians',
      error: error.message,
    });
  }
};

module.exports = {
  getElectricians,
};