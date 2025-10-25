import { postJson, getJson, putJson, deleteJson } from '../api/http.ts';

export interface ConversationThread {
  id: string;
  title: string;
  description?: string;
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'DELETED';
  metadata?: Record<string, any>;
}

export interface Message {
  id: string;
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface CreateThreadRequest {
  title: string;
  description?: string;
}

export interface AddMessageRequest {
  content: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
}

export interface UpdateTitleRequest {
  title: string;
}

export class ConversationThreadService {
  private baseUrl: string = '/api';

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async createThread(request: CreateThreadRequest, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await fetch(`${this.baseUrl}/threads`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  }

  async getThread(threadId: string, sessionId: string): Promise<ConversationThread> {
    const response = await getJson<ConversationThread>(`${this.baseUrl}/threads/${threadId}`);
    return response;
  }

  async getUserThreads(sessionId: string): Promise<ConversationThread[]> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await fetch(`${this.baseUrl}/threads`, {
      method: 'GET',
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  }

  async addMessage(threadId: string, request: AddMessageRequest, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await fetch(`${this.baseUrl}/threads/${threadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return await response.json();
  }

  async updateThreadTitle(threadId: string, request: UpdateTitleRequest, sessionId: string): Promise<ConversationThread> {
    const response = await putJson<ConversationThread>(`${this.baseUrl}/threads/${threadId}/title`, request);
    return response;
  }

  async archiveThread(threadId: string, sessionId: string): Promise<void> {
    await postJson<void>(`${this.baseUrl}/threads/${threadId}/archive`, {});
  }

  async deleteThread(threadId: string, sessionId: string): Promise<void> {
    await deleteJson<void>(`${this.baseUrl}/threads/${threadId}`);
  }
}

export const conversationThreadService = new ConversationThreadService();
