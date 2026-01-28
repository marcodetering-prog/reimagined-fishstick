import { NextResponse } from 'next/server';
import dataStore from '@/lib/data-store';

export async function GET() {
  try {
    const stats = dataStore.getStats();

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      dataStore: stats,
      environment: {
        nodeVersion: process.version,
        platform: process.platform,
        nodeEnv: process.env.NODE_ENV,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
