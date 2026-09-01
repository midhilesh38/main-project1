const path = require('path');
require('dotenv').config({
  path: [
    path.resolve(process.cwd(), '.env'),
    path.resolve(__dirname, '../.env'),
    path.resolve(__dirname, '../../.env'),
  ],
});

if (process.env.JWT_SECRET === undefined) {
  process.env.JWT_SECRET = 'pec-repair-super-secret-jwt-key-2026';
}

// Default to 5000, NOT 3000 — the frontend's Vite dev server already
// defaults to port 3000 (see frontend/vite.config.js), so using 3000 here
// too causes a silent port collision when both run at once locally.
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 5000;

// Surface errors instead of letting them fail silently / crash the process
// without explanation.
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

const createApp = require('./app');
const app = createApp();

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on http://0.0.0.0:${PORT}`);
  console.log(`Open the app in your browser at: http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(
      `[FATAL ERROR] Port ${PORT} is already in use. Close whatever else is using it, ` +
        `or set a different PORT in backend/.env, then restart.`
    );
  } else {
    console.error('[FATAL ERROR] Server failed to start:', err);
  }
  process.exit(1);
});

// Keep the event loop explicitly alive. This is a defensive guard: if some
// environment-specific issue (antivirus, a broken native module, etc.)
// causes Node's event loop to appear empty even with an active listening
// socket, this interval keeps the process from exiting unexpectedly.
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


