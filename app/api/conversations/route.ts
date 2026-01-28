import { NextRequest, NextResponse } from 'next/server';
import dataStore from '@/lib/data-store';

export async function GET(request: NextRequest) {
  console.log('[API/Conversations] GET request received');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('[API/Conversations] Fetching conversations:', { page, limit, skip });

    // Get all conversations and apply pagination
    const allConversations = dataStore.getAllConversations();
    const total = allConversations.length;

    // Sort by start time descending
    const sortedConversations = allConversations.sort((a, b) =>
      b.startTime.getTime() - a.startTime.getTime()
    );

    // Paginate
    const conversations = sortedConversations.slice(skip, skip + limit);

    console.log('[API/Conversations] ✅ Fetched', conversations.length, 'conversations out of', total);

    return NextResponse.json({
      conversations,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[API/Conversations] ❌ Conversations fetch error:', error);
    console.error('[API/Conversations] Error stack:', error instanceof Error ? error.stack : 'N/A');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
