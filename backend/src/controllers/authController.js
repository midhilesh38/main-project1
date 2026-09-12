const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');

// @desc    Register a new user (Enforces basic role & cross-field uniqueness)
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { employeeId, username, password, fullName, email, phone, departmentId } = req.body;

    if (!employeeId || !username || !password || !fullName) {
      return res.status(400).json({
        message: 'Employee ID, username, fullName, and password are required.',
      });
    }

    // Check cross-field uniqueness
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { employeeId: employeeId },
          { username: employeeId },
          { username: username },
          { employeeId: username },
          ...(email ? [{ email }] : []),
        ],
      },
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'A user with this Employee ID, username, or email already exists or conflicts with an existing identifier.',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user with default basic role: ELECTRICIAN
    const user = await prisma.user.create({
      data: {
        employeeId,
        username,
        passwordHash,
        fullName,
        email: email || null,
        phone: phone || null,
        role: 'ELECTRICIAN',
        departmentId: departmentId ? String(departmentId) : null,
      },
      select: {
        id: true,
        employeeId: true,
        username: true,
        fullName: true,
        email: true,
        role: true,
        departmentId: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      message: 'User registered successfully with default role (ELECTRICIAN).',
      user,
    });
  } catch (error) {
    console.error('Register Error:', error.message);

    if (error.code === 'P2003') {
      return res.status(400).json({
        message: 'Invalid departmentId: The specified department does not exist.',
      });
    }

    if (error.code === 'P2002') {
      return res.status(409).json({
        message: `A user with this ${error.meta?.target?.[0] || 'field'} already exists.`,
      });
    }

    res.status(500).json({ message: 'Registration failed' });
  }
};

// @desc    Login user & get JWT token
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { username, employeeId, password, role } = req.body;
    const identifier = (username || employeeId || '').trim();

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your username/Employee ID and password.',
      });
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: identifier },
          { employeeId: identifier },
          { email: identifier },
        ],
      },
      include: {
        department: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/Employee ID or password',
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Account is deactivated. Contact administrator.',
      });
    }

    // Role check normalization (case-insensitive)
    const normalizedUserRole = user.role ? String(user.role).toUpperCase() : '';
    if (role && normalizedUserRole !== String(role).toUpperCase()) {
      console.warn(`Role mismatch during login for user ID ${user.id}`);
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid username/Employee ID or password',
      });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET is not configured in the environment.');
    }

    const token = jwt.sign(
      {
        userId: user.id,
        role: normalizedUserRole,
        employeeId: user.employeeId,
        departmentId: user.departmentId,
      },
      secret,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        employeeId: user.employeeId,
        username: user.username,
        fullName: user.fullName,
        email: user.email,
        role: normalizedUserRole,
        department: user.department,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    res.status(500).json({ success: false, message: 'Login failed' });
  }
};

// @desc    Get currently logged-in user profile
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
  try {
    const userId = req.user.userId || req.user.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
        createdAt: true,
        department: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      success: true,
      user: {
        ...user,
        role: user.role ? String(user.role).toUpperCase() : user.role,
      },
    });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch user profile' });
  }
};