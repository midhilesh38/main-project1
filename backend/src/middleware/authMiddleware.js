const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// 1. Authenticate Token & Validate Active User Status
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required',
      });
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.JWT_SECRET;

    if (!secret) {
      throw new Error('JWT_SECRET is not configured in environment.');
    }

    const decoded = jwt.verify(token, secret);

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        employeeId: true,
        username: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        departmentId: true,
        isActive: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is inactive',
      });
    }

    // Attach normalized user
    req.user = {
      ...user,
      role: user.role ? String(user.role).toUpperCase() : user.role,
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (
      error.name === 'JsonWebTokenError' ||
      error.name === 'TokenExpiredError'
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication failed',
    });
  }
};

// 2. Role-Based Access Control (RBAC) with Case Normalization
const authorizeRoles = (...allowedRoles) => {
  const normalizedAllowed = allowedRoles.map((r) => String(r).toUpperCase());

  return (req, res, next) => {
    const userRole = req.user && req.user.role ? String(req.user.role).toUpperCase() : null;

    if (!userRole || !normalizedAllowed.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted to roles: ${allowedRoles.join(', ')}`,
      });
    }
    next();
  };
};

module.exports = {
  authenticate,
  authorizeRoles,
  authorize: authorizeRoles,
};