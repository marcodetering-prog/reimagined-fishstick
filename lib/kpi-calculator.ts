import { prisma } from './db';

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

export async function calculateKPIs(dateRange?: DateRange): Promise<KPIData> {
  const where = dateRange
    ? {
        timestamp: {
          gte: dateRange.startDate,
          lte: dateRange.endDate,
        },
      }
    : {};

  // Fetch all messages in the date range
  const messages = await prisma.chatMessage.findMany({
    where,
    orderBy: { timestamp: 'asc' },
  });

  // Fetch all conversations in the date range
  const conversations = await prisma.conversation.findMany({
    where: dateRange
      ? {
          startTime: {
            gte: dateRange.startDate,
            lte: dateRange.endDate,
          },
        }
      : {},
    include: {
      messages: true,
    },
  });

  // Calculate Response Metrics
  const aiMessages = messages.filter((m) => m.role === 'AI');

  const avgResponseTimeMs = aiMessages.length > 0
    ? aiMessages
        .filter((m) => m.responseTimeMs !== null)
        .reduce((sum, m) => sum + (m.responseTimeMs || 0), 0) / aiMessages.filter((m) => m.responseTimeMs !== null).length
    : null;

  const avgMessageLength = aiMessages.length > 0
    ? aiMessages.reduce((sum, m) => sum + m.message.length, 0) / aiMessages.length
    : null;

  const messagesWithSatisfaction = aiMessages.filter((m) => m.satisfactionScore !== null);
  const avgResponseQuality = messagesWithSatisfaction.length > 0
    ? messagesWithSatisfaction.reduce((sum, m) => sum + (m.satisfactionScore || 0), 0) / messagesWithSatisfaction.length
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
  const activeTenants = new Set(messages.map((m) => m.tenantId)).size;

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

function calculateMessagesOverTime(messages: any[]): Array<{ date: string; count: number }> {
  const dateCounts = new Map<string, number>();

  messages.forEach((message) => {
    const date = new Date(message.timestamp).toISOString().split('T')[0];
    dateCounts.set(date, (dateCounts.get(date) || 0) + 1);
  });

  return Array.from(dateCounts.entries())
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

function calculatePeakHours(messages: any[]): Array<{ hour: number; count: number }> {
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
  await prisma.kPISnapshot.upsert({
    where: {
      startDate_endDate: {
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      },
    },
    create: {
      startDate: dateRange.startDate,
      endDate: dateRange.endDate,
      avgResponseTimeMs: kpiData.avgResponseTimeMs,
      avgMessageLength: kpiData.avgMessageLength,
      avgResponseQuality: kpiData.avgResponseQuality,
      resolutionRate: kpiData.resolutionRate,
      avgSatisfaction: kpiData.avgSatisfaction,
      avgConversationDuration: kpiData.avgConversationDuration,
      totalConversations: kpiData.totalConversations,
      totalMessages: kpiData.totalMessages,
      activeTenants: kpiData.activeTenants,
      messagesPerDay: kpiData.messagesPerDay,
      avgTurnsToResolution: kpiData.avgTurnsToResolution,
    },
    update: {
      avgResponseTimeMs: kpiData.avgResponseTimeMs,
      avgMessageLength: kpiData.avgMessageLength,
      avgResponseQuality: kpiData.avgResponseQuality,
      resolutionRate: kpiData.resolutionRate,
      avgSatisfaction: kpiData.avgSatisfaction,
      avgConversationDuration: kpiData.avgConversationDuration,
      totalConversations: kpiData.totalConversations,
      totalMessages: kpiData.totalMessages,
      activeTenants: kpiData.activeTenants,
      messagesPerDay: kpiData.messagesPerDay,
      avgTurnsToResolution: kpiData.avgTurnsToResolution,
    },
  });
}
