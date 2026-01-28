/**
 * In-memory data store for CSV data with multi-client support
 * Data persists only during the application runtime
 */

export interface Client {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  color?: string; // For UI differentiation
}

export interface ChatRecord {
  conversation_id: string;
  tenant_id: string;
  timestamp: string;
  role: 'ai' | 'tenant';
  message: string;
  response_time_ms?: number;
  resolved?: boolean;
  satisfaction_score?: number;
  clientId?: string; // Associate with client
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
  clientId: string; // Associate with client
}

export interface UploadRecord {
  id: string;
  filename: string;
  fileSize: number;
  recordsCount: number;
  uploadedAt: Date;
  status: 'SUCCESS' | 'FAILED' | 'PROCESSING';
  errorMessage?: string;
  clientId: string; // Associate with client
}

class DataStore {
  private clients: Map<string, Client> = new Map();
  private conversations: Map<string, ConversationData> = new Map();
  private uploads: UploadRecord[] = [];
  private allMessages: ChatRecord[] = [];

  // Client management methods
  addClient(client: Omit<Client, 'id' | 'createdAt'>): Client {
    const newClient: Client = {
      ...client,
      id: this.generateId(),
      createdAt: new Date(),
    };
    this.clients.set(newClient.id, newClient);
    console.log('[DataStore] Client created:', newClient.id, newClient.name);
    return newClient;
  }

  getClient(id: string): Client | undefined {
    return this.clients.get(id);
  }

  getAllClients(): Client[] {
    return Array.from(this.clients.values()).sort((a, b) =>
      a.createdAt.getTime() - b.createdAt.getTime()
    );
  }

  updateClient(id: string, updates: Partial<Omit<Client, 'id' | 'createdAt'>>): Client | null {
    const client = this.clients.get(id);
    if (!client) return null;

    const updated = { ...client, ...updates };
    this.clients.set(id, updated);
    console.log('[DataStore] Client updated:', id);
    return updated;
  }

  deleteClient(id: string): boolean {
    const deleted = this.clients.delete(id);
    if (deleted) {
      // Also delete all data associated with this client
      // Delete conversations
      for (const [key, conv] of this.conversations.entries()) {
        if (conv.clientId === id) {
          this.conversations.delete(key);
        }
      }
      // Delete messages
      this.allMessages = this.allMessages.filter(msg => msg.clientId !== id);
      // Delete uploads
      this.uploads = this.uploads.filter(u => u.clientId !== id);
      console.log('[DataStore] Client and associated data deleted:', id);
    }
    return deleted;
  }

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

  getAllConversations(clientId?: string): ConversationData[] {
    const all = Array.from(this.conversations.values());
    if (clientId) {
      return all.filter(c => c.clientId === clientId);
    }
    return all;
  }

  getConversationsCount(clientId?: string): number {
    if (clientId) {
      return this.getAllConversations(clientId).length;
    }
    return this.conversations.size;
  }

  // Message methods
  addMessages(messages: ChatRecord[]): void {
    this.allMessages.push(...messages);
    console.log('[DataStore] Added', messages.length, 'messages. Total:', this.allMessages.length);
  }

  getAllMessages(clientId?: string): ChatRecord[] {
    if (clientId) {
      return this.allMessages.filter(msg => msg.clientId === clientId);
    }
    return this.allMessages;
  }

  getMessagesCount(clientId?: string): number {
    if (clientId) {
      return this.getAllMessages(clientId).length;
    }
    return this.allMessages.length;
  }

  // Query methods
  getMessagesByDateRange(startDate?: Date, endDate?: Date, clientId?: string): ChatRecord[] {
    let messages = clientId ? this.getAllMessages(clientId) : this.allMessages;

    if (!startDate && !endDate) {
      return messages;
    }

    return messages.filter(msg => {
      const msgDate = new Date(msg.timestamp);
      if (startDate && msgDate < startDate) return false;
      if (endDate && msgDate > endDate) return false;
      return true;
    });
  }

  getConversationsByDateRange(startDate?: Date, endDate?: Date, clientId?: string): ConversationData[] {
    const conversations = this.getAllConversations(clientId);

    if (!startDate && !endDate) {
      return conversations;
    }

    return conversations.filter(conv => {
      if (startDate && conv.startTime < startDate) return false;
      if (endDate && conv.startTime > endDate) return false;
      return true;
    });
  }

  getUniqueTenants(clientId?: string): string[] {
    const messages = clientId ? this.getAllMessages(clientId) : this.allMessages;
    const tenants = new Set<string>();
    messages.forEach(msg => tenants.add(msg.tenant_id));
    return Array.from(tenants);
  }

  // Clear methods
  clearAll(): void {
    this.clients.clear();
    this.conversations.clear();
    this.uploads = [];
    this.allMessages = [];
    console.log('[DataStore] All data cleared');
  }

  clearClientData(clientId: string): void {
    // Clear conversations for this client
    for (const [key, conv] of this.conversations.entries()) {
      if (conv.clientId === clientId) {
        this.conversations.delete(key);
      }
    }
    // Clear messages for this client
    this.allMessages = this.allMessages.filter(msg => msg.clientId !== clientId);
    // Clear uploads for this client
    this.uploads = this.uploads.filter(u => u.clientId !== clientId);
    console.log('[DataStore] Client data cleared:', clientId);
  }

  // Helper methods
  private generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  // Stats
  getStats(clientId?: string) {
    if (clientId) {
      return {
        clientsCount: this.clients.size,
        conversationsCount: this.getConversationsCount(clientId),
        messagesCount: this.getMessagesCount(clientId),
        uploadsCount: this.uploads.filter(u => u.clientId === clientId).length,
        uniqueTenants: this.getUniqueTenants(clientId).length,
      };
    }

    return {
      clientsCount: this.clients.size,
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
