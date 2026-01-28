import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  console.log('[API/Conversations] GET request received');
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    console.log('[API/Conversations] Fetching conversations:', { page, limit, skip });

    const [conversations, total] = await Promise.all([
      prisma.conversation.findMany({
        take: limit,
        skip,
        orderBy: { startTime: 'desc' },
        include: {
          messages: {
            orderBy: { timestamp: 'asc' },
            take: 5,
          },
        },
      }),
      prisma.conversation.count(),
    ]);

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
