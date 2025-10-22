// import { http } from '../api/http.ts';

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
  async createThread(request: CreateThreadRequest, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.post('/threads', request, { headers });
    return response.data;
  }

  async getThread(threadId: string, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.get(`/threads/${threadId}`, { headers });
    return response.data;
  }

  async getUserThreads(sessionId: string): Promise<ConversationThread[]> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.get('/threads', { headers });
    return response.data;
  }

  async addMessage(threadId: string, request: AddMessageRequest, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.post(`/threads/${threadId}/messages`, request, { headers });
    return response.data;
  }

  async updateThreadTitle(threadId: string, request: UpdateTitleRequest, sessionId: string): Promise<ConversationThread> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.put(`/threads/${threadId}/title`, request, { headers });
    return response.data;
  }

  async archiveThread(threadId: string, sessionId: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    await http.post(`/threads/${threadId}/archive`, {}, { headers });
  }

  async deleteThread(threadId: string, sessionId: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    await http.delete(`/threads/${threadId}`, { headers });
  }
}

export const conversationThreadService = new ConversationThreadService();
