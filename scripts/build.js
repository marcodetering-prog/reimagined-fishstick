#!/usr/bin/env node

/**
 * Build script that ensures DATABASE_URL is set before running Prisma generate
 * Uses a fallback URL if DATABASE_URL is not available (for build-time only)
 */

const { execSync } = require('child_process');

console.log('='.repeat(80));
console.log('[BUILD] Starting build process...');
console.log('='.repeat(80));

// Log environment info
console.log('[BUILD] Environment:', process.env.NODE_ENV || 'development');
console.log('[BUILD] Node version:', process.version);
console.log('[BUILD] Platform:', process.platform);

// Set a fallback DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log('[BUILD] ⚠️  DATABASE_URL not found, using fallback for build...');
  console.log('[BUILD] Note: This is only for build-time. Real DATABASE_URL must be set at runtime.');
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
} else {
  console.log('[BUILD] ✅ DATABASE_URL is set');
  const url = new URL(process.env.DATABASE_URL);
  console.log('[BUILD] Database host:', url.hostname);
}

try {
  console.log('[BUILD] Step 1/2: Generating Prisma Client...');
  console.log('[BUILD] Running: npx prisma generate');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('[BUILD] ✅ Prisma Client generated successfully');

  console.log('[BUILD] Step 2/2: Building Next.js application...');
  console.log('[BUILD] Running: npm run next:build');
  const buildStart = Date.now();
  execSync('npm run next:build', { stdio: 'inherit', env: process.env });
  const buildTime = ((Date.now() - buildStart) / 1000).toFixed(2);
  console.log(`[BUILD] ✅ Next.js build completed in ${buildTime}s`);

  console.log('='.repeat(80));
  console.log('[BUILD] ✅ Build completed successfully!');
  console.log('='.repeat(80));
} catch (error) {
  console.error('='.repeat(80));
  console.error('[BUILD] ❌ Build failed!');
  console.error('[BUILD] Error:', error.message);
  console.error('[BUILD] Stack:', error.stack);
  console.error('='.repeat(80));
  process.exit(1);
}
