import { NextRequest, NextResponse } from 'next/server';
import dataStore from '@/lib/data-store';

export async function GET(request: NextRequest) {
  console.log('[API/Clients/Stats] GET request received');
  try {
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const client = dataStore.getClient(clientId);
    if (!client) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    // Get uploads for this client
    const uploads = dataStore.getUploadsByClient(clientId);
    const successfulUploads = uploads.filter(u => u.status === 'SUCCESS');

    // Get basic stats
    const stats = dataStore.getStats(clientId);

    // Get last upload date
    const lastUploadDate = uploads.length > 0 ? uploads[0].uploadedAt.toISOString() : undefined;

    // Get data time range (from messages)
    const messages = dataStore.getAllMessages(clientId);
    let dataTimeRange: { start: string; end: string } | undefined;

    if (messages.length > 0) {
      const timestamps = messages
        .map(m => new Date(m.timestamp).getTime())
        .filter(t => !isNaN(t));

      if (timestamps.length > 0) {
        const minTime = Math.min(...timestamps);
        const maxTime = Math.max(...timestamps);
        dataTimeRange = {
          start: new Date(minTime).toISOString(),
          end: new Date(maxTime).toISOString(),
        };
      }
    }

    console.log('[API/Clients/Stats] ✅ Stats retrieved for client:', clientId);
    return NextResponse.json({
      ...stats,
      lastUploadDate,
      dataTimeRange,
    });
  } catch (error) {
    console.error('[API/Clients/Stats] ❌ Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
