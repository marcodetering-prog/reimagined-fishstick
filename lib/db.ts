import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

console.log('[DB] Initializing Prisma Client...');
console.log('[DB] NODE_ENV:', process.env.NODE_ENV);
console.log('[DB] DATABASE_URL exists:', !!process.env.DATABASE_URL);
console.log('[DB] DATABASE_URL (masked):', process.env.DATABASE_URL ?
  `${process.env.DATABASE_URL.substring(0, 20)}...${process.env.DATABASE_URL.slice(-10)}` :
  'NOT SET');

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: [
      { level: 'query', emit: 'event' },
      { level: 'error', emit: 'stdout' },
      { level: 'warn', emit: 'stdout' },
    ],
  })

// Log database queries in production to debug issues
prisma.$on('query' as never, (e: any) => {
  console.log('[DB] Query:', e.query);
  console.log('[DB] Duration:', e.duration, 'ms');
});

// Test database connection
prisma.$connect()
  .then(() => {
    console.log('[DB] ✅ Successfully connected to database');
  })
  .catch((error) => {
    console.error('[DB] ❌ Failed to connect to database:', error);
    console.error('[DB] Error details:', JSON.stringify(error, null, 2));
  });

if (process.env.NODE_ENV !== 'production') {
  console.log('[DB] Development mode: caching Prisma instance globally');
  globalForPrisma.prisma = prisma;
}
