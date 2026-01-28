import Papa from 'papaparse';

export interface ChatHistoryRecord {
  conversation_id: string;
  tenant_id: string;
  timestamp: string;
  role: 'ai' | 'tenant';
  message: string;
  response_time_ms?: number;
  resolved?: boolean;
  satisfaction_score?: number;
}

export interface ParseResult {
  success: boolean;
  data?: ChatHistoryRecord[];
  error?: string;
  recordsCount?: number;
}

export async function parseCSVFile(file: File): Promise<ParseResult> {
  try {
    // Read file content as text first (works in Next.js server environment)
    const text = await file.text();

    return new Promise((resolve) => {
      // Parse the text string instead of the File object
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.toLowerCase().trim().replace(/\s+/g, '_'),
        complete: (results) => {
          try {
            if (results.errors.length > 0) {
              resolve({
                success: false,
                error: `CSV parsing errors: ${results.errors.map(e => e.message).join(', ')}`,
              });
              return;
            }

            const rawData = results.data as any[];

            // Detect format and transform if needed
            const transformedData = detectAndTransformFormat(rawData);

            const validated = validateRecords(transformedData);

            if (!validated.success) {
              resolve(validated);
              return;
            }

            resolve({
              success: true,
              data: validated.data,
              recordsCount: validated.data?.length || 0,
            });
          } catch (error) {
            resolve({
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error during parsing',
            });
          }
        },
        error: (error: Error) => {
          resolve({
            success: false,
            error: error.message,
          });
        },
      });
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to read file',
    };
  }
}

/**
 * Detect CSV format and transform to standard format
 * Supports multiple formats:
 * 1. Standard format: conversation_id, tenant_id, timestamp, role, message
 * 2. Alternative format: Content, MessageType, TimeSent, ConversationId
 */
function detectAndTransformFormat(records: any[]): any[] {
  if (!records || records.length === 0) return records;

  const firstRecord = records[0];
  const headers = Object.keys(firstRecord);

  // Check if it's the alternative format (Content, MessageType, TimeSent, ConversationId)
  const hasContent = headers.includes('content');
  const hasMessageType = headers.includes('messagetype');
  const hasTimeSent = headers.includes('timesent');
  const hasConversationId = headers.includes('conversationid');

  if (hasContent && hasMessageType && hasTimeSent && hasConversationId) {
    console.log('[CSV Parser] Detected alternative format, transforming...');
    return transformAlternativeFormat(records);
  }

  // Already in standard format
  return records;
}

/**
 * Transform alternative format to standard format
 * Maps: Content → message, MessageType → role, TimeSent → timestamp, ConversationId → conversation_id
 * MessageType mapping: 1 = ai, 3 = tenant, others = skip
 */
function transformAlternativeFormat(records: any[]): any[] {
  const transformed: any[] = [];
  let skippedCount = 0;

  for (const record of records) {
    const messageType = parseInt(record.messagetype);

    // Skip system messages (type 5, 6) and other non-conversation messages
    if (messageType !== 1 && messageType !== 3) {
      skippedCount++;
      continue;
    }

    // Convert MessageType to role: 1 = ai, 3 = tenant
    const role = messageType === 1 ? 'ai' : 'tenant';

    // Generate tenant_id from conversation_id (use conversation_id as tenant_id)
    // In a real scenario, you might want to extract this differently
    const conversationId = record.conversationid;
    const tenantId = conversationId; // Using conversation_id as tenant_id for now

    // Parse timestamp - convert from "2025-03-24 08:39:41.3790098" to ISO format
    let timestamp = record.timesent;
    try {
      // Try to parse and convert to ISO format
      const date = new Date(timestamp);
      if (!isNaN(date.getTime())) {
        timestamp = date.toISOString();
      }
    } catch (e) {
      // Keep original if parsing fails
    }

    transformed.push({
      conversation_id: conversationId,
      tenant_id: tenantId,
      timestamp: timestamp,
      role: role,
      message: record.content || '',
    });
  }

  if (skippedCount > 0) {
    console.log(`[CSV Parser] Skipped ${skippedCount} system messages (MessageType 5, 6, etc.)`);
  }

  console.log(`[CSV Parser] Transformed ${transformed.length} records from alternative format`);
  return transformed;
}

export async function parseJSONFile(file: File): Promise<ParseResult> {
  try {
    const text = await file.text();
    const json = JSON.parse(text);

    // Support both array and single object
    const data = Array.isArray(json) ? json : [json];

    const validated = validateRecords(data);

    if (!validated.success) {
      return validated;
    }

    return {
      success: true,
      data: validated.data,
      recordsCount: validated.data?.length || 0,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Invalid JSON format',
    };
  }
}

function validateRecords(records: any[]): ParseResult {
  if (!records || records.length === 0) {
    return {
      success: false,
      error: 'No records found in file',
    };
  }

  const requiredFields = ['conversation_id', 'tenant_id', 'timestamp', 'role', 'message'];
  const validRecords: ChatHistoryRecord[] = [];
  const errors: string[] = [];

  for (let i = 0; i < records.length; i++) {
    const record = records[i];

    // Check required fields
    const missingFields = requiredFields.filter(field => !record[field]);
    if (missingFields.length > 0) {
      errors.push(`Record ${i + 1}: Missing required fields: ${missingFields.join(', ')}`);
      continue;
    }

    // Validate role
    const role = record.role.toLowerCase();
    if (role !== 'ai' && role !== 'tenant') {
      errors.push(`Record ${i + 1}: Invalid role "${record.role}". Must be "ai" or "tenant"`);
      continue;
    }

    // Parse optional numeric fields
    const responseTimeMs = record.response_time_ms ? parseFloat(record.response_time_ms) : undefined;
    const satisfactionScore = record.satisfaction_score ? parseFloat(record.satisfaction_score) : undefined;

    // Parse resolved field
    let resolved: boolean | undefined = undefined;
    if (record.resolved !== undefined && record.resolved !== null && record.resolved !== '') {
      if (typeof record.resolved === 'boolean') {
        resolved = record.resolved;
      } else if (typeof record.resolved === 'string') {
        const resolvedStr = record.resolved.toLowerCase();
        resolved = resolvedStr === 'true' || resolvedStr === '1' || resolvedStr === 'yes';
      }
    }

    validRecords.push({
      conversation_id: record.conversation_id.toString(),
      tenant_id: record.tenant_id.toString(),
      timestamp: record.timestamp,
      role: role as 'ai' | 'tenant',
      message: record.message.toString(),
      response_time_ms: responseTimeMs,
      resolved,
      satisfaction_score: satisfactionScore,
    });
  }

  if (errors.length > 0 && validRecords.length === 0) {
    return {
      success: false,
      error: errors.slice(0, 5).join('\n') + (errors.length > 5 ? `\n... and ${errors.length - 5} more errors` : ''),
    };
  }

  return {
    success: true,
    data: validRecords,
    recordsCount: validRecords.length,
  };
}
