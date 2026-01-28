/**
 * In-memory data store for CSV data
 * Data persists only during the application runtime
 */

export interface ChatRecord {
  conversation_id: string;
  tenant_id: string;
  timestamp: string;
  role: 'ai' | 'tenant';
  message: string;
  response_time_ms?: number;
  resolved?: boolean;
  satisfaction_score?: number;
}

export interface ConversationData {
  conversationId: string;
  tenantId: string;
  startTime: Date;
  endTime: Date;
  messageCount: number;
  resolved: boolean;
  satisfactionScore: number | null;
  duration: number; // in seconds
  messages: ChatRecord[];
}

export interface UploadRecord {
  id: string;
  filename: string;
  fileSize: number;
  recordsCount: number;
  uploadedAt: Date;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  errorMessage?: string;
}

class DataStore {
  private conversations: Map<string, ConversationData> = new Map();
  private uploads: UploadRecord[] = [];
  private allMessages: ChatRecord[] = [];

  // Upload history methods
  addUpload(upload: Omit<UploadRecord, 'id' | 'uploadedAt'>): UploadRecord {
    const record: UploadRecord = {
      ...upload,
      id: this.generateId(),
      uploadedAt: new Date(),
    };
    this.uploads.push(record);
    console.log('[DataStore] Upload record created:', record.id);
    return record;
  }

  updateUpload(id: string, updates: Partial<UploadRecord>): void {
    const index = this.uploads.findIndex(u => u.id === id);
    if (index !== -1) {
      this.uploads[index] = { ...this.uploads[index], ...updates };
      console.log('[DataStore] Upload record updated:', id);
    }
  }

  // Conversation methods
  addOrUpdateConversation(data: ConversationData): void {
    this.conversations.set(data.conversationId, data);
    console.log('[DataStore] Conversation stored:', data.conversationId);
  }

  getConversation(conversationId: string): ConversationData | undefined {
    return this.conversations.get(conversationId);
  }

  getAllConversations(): ConversationData[] {
    return Array.from(this.conversations.values());
  }

  getConversationsCount(): number {
    return this.conversations.size;
  }

  // Message methods
  addMessages(messages: ChatRecord[]): void {
    this.allMessages.push(...messages);
    console.log('[DataStore] Added', messages.length, 'messages. Total:', this.allMessages.length);
  }

  getAllMessages(): ChatRecord[] {
    return this.allMessages;
  }

  getMessagesCount(): number {
    return this.allMessages.length;
  }

  // Query methods
  getMessagesByDateRange(startDate?: Date, endDate?: Date): ChatRecord[] {
    if (!startDate && !endDate) {
      return this.allMessages;
    }

    return this.allMessages.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      if (startDate && msgDate < startDate) return false;
      if (endDate && msgDate > endDate) return false;
      return true;
    });
  }

  getConversationsByDateRange(startDate?: Date, endDate?: Date): ConversationData[] {
    const conversations = this.getAllConversations();

    if (!startDate && !endDate) {
      return conversations;
    }

    return conversations.filter(conv => {
      if (startDate && conv.startTime < startDate) return false;
      if (endDate && conv.startTime > endDate) return false;
      return true;
    });
  }

  getUniqueTenants(): string[] {
    const tenants = new Set<string>();
    this.allMessages.forEach(msg => tenants.add(msg.tenant_id));
    return Array.from(tenants);
  }

  // Clear methods
  clearAll(): void {
    this.conversations.clear();
    this.uploads = [];
    this.allMessages = [];
    console.log('[DataStore] All data cleared');
  }

  clearConversations(): void {
    this.conversations.clear();
    this.allMessages = [];
    console.log('[DataStore] Conversations and messages cleared');
  }

  // Helper methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Stats
  getStats() {
    return {
      conversationsCount: this.conversations.size,
      messagesCount: this.allMessages.length,
      uploadsCount: this.uploads.length,
      uniqueTenants: this.getUniqueTenants().length,
    };
  }
}

// Singleton instance
const dataStore = new DataStore();

export default dataStore;
