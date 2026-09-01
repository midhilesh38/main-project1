const path = require('path');
require('dotenv').config();

if (!process.env.JWT_SECRET || process.env.JWT_SECRET.trim() === '') {
  process.env.JWT_SECRET = 'pec-repair-super-secret-jwt-key-2026';
}

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

process.on('unhandledRejection', (reason) => {
  console.error('[UNHANDLED PROMISE REJECTION]', reason);
});
process.on('uncaughtException', (err) => {
  console.error('[UNCAUGHT EXCEPTION]', err);
});

const assertRequiredEnv = () => {
  const requiredEnvVars = ['JWT_SECRET'];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar] || process.env[envVar].trim() === '') {
      console.error(`[FATAL ERROR] Missing required environment variable: ${envVar}`);
      console.error(`Please set ${envVar} before starting the server.`);
      process.exit(1);
    }
  }
};

assertRequiredEnv();

const createApp = require('./backend/src/app');
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Open the app in your browser at: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[FATAL ERROR] Port ${PORT} is already in use. Close whatever else is using it, ` +
        `or set a different PORT in your .env file, then restart.`
    );
  } else {
    console.error('[FATAL ERROR] Server failed to start:', err);
  }
  process.exit(1);
});

// Defensive guard against unexplained early process exit.
setInterval(() => {}, 1 << 30);

const gracefulShutdown = (signal) => {
  console.log(`Received ${signal} signal, closing HTTP server...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    process.exit(0);
  }, 3000).unref();
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

module.exports = {
  assertRequiredEnv,
  server,
};



