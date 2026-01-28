/**
 * Startup logger - Logs important information when the application starts
 */

export function logStartupInfo() {
  console.log('='.repeat(80));
  console.log('[STARTUP] AI KPI Dashboard - Server Starting');
  console.log('='.repeat(80));

  // Environment
  console.log('[STARTUP] Environment Information:');
  console.log('[STARTUP]   NODE_ENV:', process.env.NODE_ENV);
  console.log('[STARTUP]   Next.js Version:', require('next/package.json').version);
  console.log('[STARTUP]   Node Version:', process.version);
  console.log('[STARTUP]   Platform:', process.platform);
  console.log('[STARTUP]   Architecture:', process.arch);

  // Database
  console.log('[STARTUP] Database Configuration:');
  console.log('[STARTUP]   DATABASE_URL exists:', !!process.env.DATABASE_URL);
  if (process.env.DATABASE_URL) {
    const url = new URL(process.env.DATABASE_URL);
    console.log('[STARTUP]   Database Host:', url.hostname);
    console.log('[STARTUP]   Database Port:', url.port || '5432');
    console.log('[STARTUP]   Database Name:', url.pathname.substring(1));
    console.log('[STARTUP]   Database User:', url.username);
  } else {
    console.error('[STARTUP]   ❌ DATABASE_URL is not set!');
  }

  // Memory
  const memUsage = process.memoryUsage();
  console.log('[STARTUP] Memory Usage:');
  console.log('[STARTUP]   RSS:', Math.round(memUsage.rss / 1024 / 1024), 'MB');
  console.log('[STARTUP]   Heap Total:', Math.round(memUsage.heapTotal / 1024 / 1024), 'MB');
  console.log('[STARTUP]   Heap Used:', Math.round(memUsage.heapUsed / 1024 / 1024), 'MB');

  // Prisma
  console.log('[STARTUP] Prisma Configuration:');
  try {
    const prismaVersion = require('@prisma/client/package.json').version;
    console.log('[STARTUP]   Prisma Client Version:', prismaVersion);
  } catch (e) {
    console.error('[STARTUP]   ❌ Failed to get Prisma version:', e);
  }

  console.log('='.repeat(80));
  console.log('[STARTUP] ✅ Application initialization complete');
  console.log('='.repeat(80));
}

// Log unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] ❌ Unhandled Rejection at:', promise);
  console.error('[ERROR] Reason:', reason);
  console.error('[ERROR] Stack:', reason instanceof Error ? reason.stack : 'N/A');
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] ❌ Uncaught Exception:', error);
  console.error('[ERROR] Stack:', error.stack);
  console.error('[ERROR] Application may need to restart');
  // Don't exit in production to allow Railway to restart
  if (process.env.NODE_ENV !== 'production') {
    process.exit(1);
  }
});

// Log graceful shutdown
process.on('SIGTERM', () => {
  console.log('[SHUTDOWN] ⚠️  SIGTERM received, starting graceful shutdown...');
});

process.on('SIGINT', () => {
  console.log('[SHUTDOWN] ⚠️  SIGINT received, starting graceful shutdown...');
});
