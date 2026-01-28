import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { parseCSVFile, parseJSONFile } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : file.name.toLowerCase().endsWith('.json') ? 'json' : null;

    if (!fileType) {
      return NextResponse.json({ error: 'Invalid file type. Only CSV and JSON files are supported' }, { status: 400 });
    }

    // Parse file
    const parseResult = fileType === 'csv' ? await parseCSVFile(file) : await parseJSONFile(file);

    if (!parseResult.success || !parseResult.data) {
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const records = parseResult.data;

    // Record upload history
    const uploadRecord = await prisma.uploadHistory.create({
      data: {
        filename: file.name,
        fileSize: file.size,
        recordsCount: records.length,
        status: 'PROCESSING',
      },
    });

    try {
      // Group records by conversation
      const conversationMap = new Map<string, typeof records>();

      records.forEach((record) => {
        if (!conversationMap.has(record.conversation_id)) {
          conversationMap.set(record.conversation_id, []);
        }
        conversationMap.get(record.conversation_id)!.push(record);
      });

      // Process each conversation
      for (const [conversationId, convRecords] of conversationMap.entries()) {
        // Sort by timestamp
        convRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const startTime = new Date(convRecords[0].timestamp);
        const endTime = new Date(convRecords[convRecords.length - 1].timestamp);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        // Check if conversation already exists
        const existingConversation = await prisma.conversation.findUnique({
          where: { conversationId },
        });

        // Get tenant ID and resolution status
        const tenantId = convRecords[0].tenant_id;
        const resolved = convRecords.some((r) => r.resolved === true);
        const satisfactionScores = convRecords.filter((r) => r.satisfaction_score !== undefined).map((r) => r.satisfaction_score!);
        const avgSatisfaction = satisfactionScores.length > 0
          ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
          : null;

        if (existingConversation) {
          // Update existing conversation
          await prisma.conversation.update({
            where: { conversationId },
            data: {
              endTime,
              messageCount: convRecords.length,
              resolved,
              satisfactionScore: avgSatisfaction,
              duration,
            },
          });

          // Delete old messages and insert new ones
          await prisma.chatMessage.deleteMany({
            where: { conversationId: existingConversation.id },
          });
        } else {
          // Create new conversation
          await prisma.conversation.create({
            data: {
              conversationId,
              tenantId,
              startTime,
              endTime,
              messageCount: convRecords.length,
              resolved,
              satisfactionScore: avgSatisfaction,
              duration,
            },
          });
        }

        // Get the conversation ID
        const conversation = await prisma.conversation.findUnique({
          where: { conversationId },
        });

        if (!conversation) {
          throw new Error(`Failed to create/find conversation ${conversationId}`);
        }

        // Insert messages
        await prisma.chatMessage.createMany({
          data: convRecords.map((record) => ({
            conversationId: conversation.id,
            tenantId: record.tenant_id,
            timestamp: new Date(record.timestamp),
            role: record.role.toUpperCase() as 'AI' | 'TENANT',
            message: record.message,
            responseTimeMs: record.response_time_ms,
            resolved: record.resolved,
            satisfactionScore: record.satisfaction_score,
          })),
        });
      }

      // Update upload status
      await prisma.uploadHistory.update({
        where: { id: uploadRecord.id },
        data: { status: 'SUCCESS' },
      });

      return NextResponse.json({
        success: true,
        recordsCount: records.length,
        conversationsCount: conversationMap.size,
      });
    } catch (error) {
      // Update upload status with error
      await prisma.uploadHistory.update({
        where: { id: uploadRecord.id },
        data: {
          status: 'FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
