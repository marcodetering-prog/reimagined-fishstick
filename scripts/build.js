#!/usr/bin/env node

/**
 * Build script that ensures DATABASE_URL is set before running Prisma generate
 * Uses a fallback URL if DATABASE_URL is not available (for build-time only)
 */

const { execSync } = require('child_process');

// Set a fallback DATABASE_URL if not present
if (!process.env.DATABASE_URL) {
  console.log('⚠️  DATABASE_URL not found, using fallback for build...');
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/postgres';
}

try {
  console.log('🔧 Generating Prisma Client...');
  execSync('npx prisma generate', { stdio: 'inherit', env: process.env });

  console.log('📦 Building Next.js application...');
  execSync('npm run next:build', { stdio: 'inherit', env: process.env });

  console.log('✅ Build completed successfully!');
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
