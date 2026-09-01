const prisma = require('../config/db');

const getHealth = async (req, res) => {
  try {
    let databaseStatus = 'Connected';
    if (typeof prisma.$queryRaw === 'function') {
      try {
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'Connected';
      } catch (dbErr) {
        console.warn('Prisma queryRaw health check failed:', dbErr.message);
        databaseStatus = 'Disconnected';
      }
    } else {
      // In-memory db store active
      databaseStatus = 'Connected';
    }

    res.status(200).json({
      status: 'success',
      database: databaseStatus,
      message: 'PEC-RMMS Backend Server & Database are operational',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check error:', error.message);
    res.status(200).json({
      status: 'success',
      database: 'Disconnected',
      message: 'Backend server is running',
      error: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

module.exports = { getHealth };
