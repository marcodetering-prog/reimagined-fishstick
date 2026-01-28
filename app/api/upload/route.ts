import { NextRequest, NextResponse } from 'next/server';
import dataStore, { type ChatRecord, type ConversationData } from '@/lib/data-store';
import { parseCSVFile, parseJSONFile } from '@/lib/csv-parser';

export async function POST(request: NextRequest) {
  console.log('[API/Upload] POST request received');
  try {
    console.log('[API/Upload] Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const clientId = formData.get('clientId') as string;

    if (!file) {
      console.log('[API/Upload] ❌ No file provided');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!clientId) {
      console.log('[API/Upload] ❌ No client ID provided');
      return NextResponse.json({ error: 'Client ID is required' }, { status: 400 });
    }

    // Verify client exists
    const client = dataStore.getClient(clientId);
    if (!client) {
      console.log('[API/Upload] ❌ Client not found:', clientId);
      return NextResponse.json({ error: 'Client not found' }, { status: 404 });
    }

    console.log('[API/Upload] File received for client:', client.name, {
      name: file.name,
      size: file.size,
      type: file.type
    });

    // Validate file type
    const fileType = file.name.toLowerCase().endsWith('.csv') ? 'csv' : file.name.toLowerCase().endsWith('.json') ? 'json' : null;

    if (!fileType) {
      console.log('[API/Upload] ❌ Invalid file type:', file.name);
      return NextResponse.json({ error: 'Invalid file type. Only CSV and JSON files are supported' }, { status: 400 });
    }

    console.log('[API/Upload] File type detected:', fileType);
    console.log('[API/Upload] Parsing file...');

    // Parse file
    const parseResult = fileType === 'csv' ? await parseCSVFile(file) : await parseJSONFile(file);

    if (!parseResult.success || !parseResult.data) {
      console.log('[API/Upload] ❌ Parse error:', parseResult.error);
      return NextResponse.json({ error: parseResult.error }, { status: 400 });
    }

    const records = parseResult.data as ChatRecord[];
    console.log('[API/Upload] ✅ File parsed successfully:', records.length, 'records');

    // Associate all records with the client
    records.forEach(record => {
      record.clientId = clientId;
    });

    // Record upload history
    console.log('[API/Upload] Creating upload history record...');
    const uploadRecord = dataStore.addUpload({
      filename: file.name,
      fileSize: file.size,
      recordsCount: records.length,
      status: 'PROCESSING',
      clientId,
    });
    console.log('[API/Upload] Upload record created:', uploadRecord.id);

    try {
      // Group records by conversation
      console.log('[API/Upload] Grouping records by conversation...');
      const conversationMap = new Map<string, ChatRecord[]>();

      records.forEach((record) => {
        if (!conversationMap.has(record.conversation_id)) {
          conversationMap.set(record.conversation_id, []);
        }
        conversationMap.get(record.conversation_id)!.push(record);
      });

      console.log('[API/Upload] Found', conversationMap.size, 'unique conversations');

      // Process each conversation
      console.log('[API/Upload] Processing conversations...');
      let processedCount = 0;

      for (const [conversationId, convRecords] of conversationMap.entries()) {
        processedCount++;
        if (processedCount % 10 === 0 || processedCount === conversationMap.size) {
          console.log(`[API/Upload] Processing conversation ${processedCount}/${conversationMap.size}`);
        }

        // Sort by timestamp
        convRecords.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

        const startTime = new Date(convRecords[0].timestamp);
        const endTime = new Date(convRecords[convRecords.length - 1].timestamp);
        const duration = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

        // Get tenant ID and resolution status
        const tenantId = convRecords[0].tenant_id;
        const resolved = convRecords.some((r) => r.resolved === true);
        const satisfactionScores = convRecords
          .filter((r) => r.satisfaction_score !== undefined)
          .map((r) => r.satisfaction_score!);
        const avgSatisfaction = satisfactionScores.length > 0
          ? satisfactionScores.reduce((sum, score) => sum + score, 0) / satisfactionScores.length
          : null;

        const conversationData: ConversationData = {
          conversationId,
          tenantId,
          startTime,
          endTime,
          messageCount: convRecords.length,
          resolved,
          satisfactionScore: avgSatisfaction,
          duration,
          messages: convRecords,
          clientId,
        };

        dataStore.addOrUpdateConversation(conversationData);
      }

      // Store all messages
      dataStore.addMessages(records);

      // Update upload status
      console.log('[API/Upload] All conversations processed successfully');
      dataStore.updateUpload(uploadRecord.id, { status: 'SUCCESS' });

      // Log stats
      const stats = dataStore.getStats();
      console.log('[API/Upload] Data store stats:', stats);

      console.log('[API/Upload] ✅ Upload completed successfully');
      return NextResponse.json({
        success: true,
        recordsCount: records.length,
        conversationsCount: conversationMap.size,
        stats,
      });
    } catch (error) {
      console.error('[API/Upload] ❌ Error processing conversations:', error);
      console.error('[API/Upload] Error stack:', error instanceof Error ? error.stack : 'N/A');

      // Update upload status with error
      dataStore.updateUpload(uploadRecord.id, {
        status: 'FAILED',
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  } catch (error) {
    console.error('[API/Upload] ❌ Upload error:', error);
    console.error('[API/Upload] Error type:', typeof error);
    console.error('[API/Upload] Error stack:', error instanceof Error ? error.stack : 'N/A');
    console.error('[API/Upload] Error details:', JSON.stringify(error, null, 2));

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
