#!/usr/bin/env node

/**
 * Postinstall script that ensures DATABASE_URL is set before running Prisma generate
 * Uses a fallback URL if DATABASE_URL is not available (for build-time only)
 */

const { execSync } = require('child_process');

console.log('[POSTINSTALL] Running post-installation steps...');

// Set a fallback DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log('[POSTINSTALL] ⚠️  DATABASE_URL not found, using fallback for Prisma generation...');
  console.log('[POSTINSTALL] Note: This is only for build-time. Real DATABASE_URL must be set at runtime.');
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
} else {
  console.log('[POSTINSTALL] ✅ DATABASE_URL is set');
}

try {
  console.log('[POSTINSTALL] 🔧 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });
  console.log('[POSTINSTALL] ✅ Prisma Client generated successfully!');
} catch (error) {
  console.error('[POSTINSTALL] ❌ Prisma generation failed:', error.message);
  console.error('[POSTINSTALL] Error stack:', error.stack);
  process.exit(1);
}
