const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const jobRoutes = require('./routes/jobRoutes');
const complaintRoutes = require('./routes/complaintRoutes');
const healthRoutes = require('./routes/healthRoutes');
const complaintStatusRoutes = require('./routes/complaintStatusRoutes');
const authRoutes = require('./routes/authRoutes');
const approvalRoutes = require('./routes/approvalRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const verificationRoutes = require('./routes/verificationRoutes');

const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    })
  );
  app.use(express.json());

  // Health and API Routes
  app.use('/', healthRoutes);
  app.use('/api', healthRoutes);
  app.use('/api/auth', authRoutes);
  app.use('/api/approvals', approvalRoutes);
  app.use('/api/complaints', complaintRoutes);
  app.use('/api/complaints', complaintStatusRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/tickets', ticketRoutes);
  app.use('/api/verifications', verificationRoutes);

  // Serve Frontend Assets in production / built mode
  const candidateDistPaths = [
    path.resolve(process.cwd(), 'frontend/dist'),
    path.resolve(__dirname, '../../frontend/dist'),
    path.resolve(process.cwd(), 'dist'),
    path.resolve(__dirname, '../../dist'),
    path.resolve(__dirname, '../dist'),
  ];
  const distPath = candidateDistPaths.find((p) => fs.existsSync(p));
  if (distPath) {
    app.use(express.static(distPath));

    // SPA fallback middleware for Express 5 compatibility
    app.use((req, res, next) => {
      if (req.method === 'GET' && !req.path.startsWith('/api')) {
        const indexPath = path.join(distPath, 'index.html');
        if (fs.existsSync(indexPath)) {
          return res.sendFile(indexPath);
        }
      }
      next();
    });
  }

  // 404 Handler for unhandled API or missing routes
  app.use((req, res) => {
    res.status(404).json({
      success: false,
      message: `Cannot ${req.method} ${req.originalUrl}`,
    });
  });

  return app;
};

module.exports = createApp;
