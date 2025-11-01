import { postJson, getJson, putJson, deleteJson } from '../api/http.ts';
import { toAbsoluteUrl } from '../utils/urlUtils.ts';

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

    const url = toAbsoluteUrl(this.baseUrl, '/threads');
    const response = await fetch(url, {
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
    const url = toAbsoluteUrl(this.baseUrl, `/threads/${threadId}`);
    const response = await getJson<ConversationThread>(url);
    return response;
  }

  async getUserThreads(sessionId: string): Promise<ConversationThread[]> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, '/threads');
    const response = await fetch(url, {
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

    const url = toAbsoluteUrl(this.baseUrl, `/threads/${threadId}/messages`);
    const response = await fetch(url, {
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
    const url = toAbsoluteUrl(this.baseUrl, `/threads/${threadId}/title`);
    const response = await putJson<ConversationThread>(url, request);
    return response;
  }

  async archiveThread(threadId: string, sessionId: string): Promise<void> {
    const url = toAbsoluteUrl(this.baseUrl, `/threads/${threadId}/archive`);
    await postJson<void>(url, {});
  }

  async deleteThread(threadId: string, sessionId: string): Promise<void> {
    const url = toAbsoluteUrl(this.baseUrl, `/threads/${threadId}`);
    await deleteJson<void>(url);
  }
}

export const conversationThreadService = new ConversationThreadService();
