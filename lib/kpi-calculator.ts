import dataStore, { type ChatRecord, type ConversationData } from './data-store';

export interface KPIData {
  // Response Metrics
  avgResponseTimeMs: number | null;
  avgMessageLength: number | null;
  avgResponseQuality: number | null;

  // Conversation Metrics
  resolutionRate: number | null;
  avgSatisfaction: number | null;
  avgConversationDuration: number | null;

  // Usage Metrics
  totalConversations: number;
  totalMessages: number;
  activeTenants: number;
  messagesPerDay: number | null;

  // AI Accuracy Metrics
  avgTurnsToResolution: number | null;

  // Time series data
  messagesOverTime: Array<{ date: string; count: number }>;
  peakHours: Array<{ hour: number; count: number }>;
}

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export async function calculateKPIs(dateRange?: DateRange, clientId?: string): Promise<KPIData> {
  // Fetch messages and conversations from data store
  const messages = dateRange
    ? dataStore.getMessagesByDateRange(dateRange.startDate, dateRange.endDate, clientId)
    : dataStore.getAllMessages(clientId);

  const conversations = dateRange
    ? dataStore.getConversationsByDateRange(dateRange.startDate, dateRange.endDate, clientId)
    : dataStore.getAllConversations(clientId);

  // Calculate Response Metrics
  const aiMessages = messages.filter((m) => m.role.toLowerCase() === 'ai');

  const avgResponseTimeMs = aiMessages.length > 0
    ? aiMessages
        .filter((m) => m.response_time_ms !== null && m.response_time_ms !== undefined)
        .reduce((sum, m) => sum + (m.response_time_ms || 0), 0) /
        aiMessages.filter((m) => m.response_time_ms !== null && m.response_time_ms !== undefined).length
    : null;

  const avgMessageLength = aiMessages.length > 0
    ? aiMessages.reduce((sum, m) => sum + m.message.length, 0) / aiMessages.length
    : null;

  const messagesWithSatisfaction = aiMessages.filter((m) => m.satisfaction_score !== null && m.satisfaction_score !== undefined);
  const avgResponseQuality = messagesWithSatisfaction.length > 0
    ? messagesWithSatisfaction.reduce((sum, m) => sum + (m.satisfaction_score || 0), 0) / messagesWithSatisfaction.length
    : null;

  // Calculate Conversation Metrics
  const resolvedConversations = conversations.filter((c) => c.resolved);
  const resolutionRate = conversations.length > 0
    ? (resolvedConversations.length / conversations.length) * 100
    : null;

  const conversationsWithSatisfaction = conversations.filter((c) => c.satisfactionScore !== null);
  const avgSatisfaction = conversationsWithSatisfaction.length > 0
    ? conversationsWithSatisfaction.reduce((sum, c) => sum + (c.satisfactionScore || 0), 0) / conversationsWithSatisfaction.length
    : null;

  const conversationsWithDuration = conversations.filter((c) => c.duration !== null);
  const avgConversationDuration = conversationsWithDuration.length > 0
    ? conversationsWithDuration.reduce((sum, c) => sum + (c.duration || 0), 0) / conversationsWithDuration.length
    : null;

  // Calculate Usage Metrics
  const totalConversations = conversations.length;
  const totalMessages = messages.length;
  const activeTenants = new Set(messages.map((m) => m.tenant_id)).size;

  // Messages per day
  const dateRangeDays = dateRange
    ? Math.ceil((dateRange.endDate.getTime() - dateRange.startDate.getTime()) / (1000 * 60 * 60 * 24))
    : null;
  const messagesPerDay = dateRangeDays && dateRangeDays > 0
    ? totalMessages / dateRangeDays
    : null;

  // Calculate AI Accuracy Metrics
  const avgTurnsToResolution = resolvedConversations.length > 0
    ? resolvedConversations.reduce((sum, c) => sum + c.messageCount, 0) / resolvedConversations.length / 2 // Divide by 2 for back-and-forth
    : null;

  // Time Series Data
  const messagesOverTime = calculateMessagesOverTime(messages);
  const peakHours = calculatePeakHours(messages);

  return {
    avgResponseTimeMs,
    avgMessageLength,
    avgResponseQuality,
    resolutionRate,
    avgSatisfaction,
    avgConversationDuration,
    totalConversations,
    totalMessages,
    activeTenants,
    messagesPerDay,
    avgTurnsToResolution,
    messagesOverTime,
    peakHours,
  };
}

function calculateMessagesOverTime(messages: ChatRecord[]): Array<{ date: string; count: number }> {
  const dateCounts = new Map<string, number>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toISOString().split('T')[0];
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
  });

  return Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculatePeakHours(messages: ChatRecord[]): Array<{ hour: number; count: number }> {
  const hourCounts = new Map<number, number>();

  messages.forEach((message) => {
    const hour = new Date(message.timestamp).getHours();
    hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
  });

  return Array.from(hourCounts.entries())
    .map(([hour, count]) => ({ hour, count }))
    .sort((a, b) => a.hour - b.hour);
}

export async function cacheKPISnapshot(dateRange: DateRange, kpiData: KPIData) {
  // No-op for now - we're not caching KPIs in memory
  // This could be extended to cache in memory if needed
  console.log('[KPI] Caching skipped in database-free mode');
}
