/**
 * Next.js instrumentation file - runs on server startup
 * This is called before any pages or API routes are loaded
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Import and run startup logger
    const { logStartupInfo } = await import('./lib/startup-logger');
    logStartupInfo();

    // Import database to ensure connection is established
    console.log('[INSTRUMENTATION] Initializing database connection...');
    try {
      const { prisma } = await import('./lib/db');
      await prisma.$connect();
      console.log('[INSTRUMENTATION] ✅ Database connection successful');
    } catch (error) {
      console.error('[INSTRUMENTATION] ❌ Database connection failed:', error);
      throw error;
    }
  }
}
