import { postJson } from '../api/http.ts';
import { toAbsoluteUrl } from '../utils/urlUtils.ts';
import type { SearchResult } from '../types/prompt.ts';

// 단일 정의 유지를 위해 shared/types/prompt.ts 의 SearchResult 재export.
export type { SearchResult };

export interface AdvancedSearchRequest {
  query: string;
  searchType: 'SEMANTIC' | 'KEYWORD' | 'HYBRID';
  filters?: SearchFilter[];
  sort?: SearchSort;
  page?: number;
  size?: number;
  sessionId?: string;
}

export interface SearchFilter {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'BETWEEN' | 'CONTAINS' | 'IN';
  value: any;
  value2?: any;
}

export interface SearchSort {
  field: string;
  direction: 'ASC' | 'DESC';
}

export interface AdvancedSearchResponse {
  results: SearchResult[];
  page: number;
  size: number;
  totalElements: number;
  searchType: string;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  metadata?: Record<string, any>;
}

export class AdvancedSearchService {
  private baseUrl: string = '';

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async search(request: AdvancedSearchRequest): Promise<AdvancedSearchResponse> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (request.sessionId) {
      headers['X-Session-ID'] = request.sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, '/advanced-search');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async getSearchHistory(sessionId: string): Promise<SearchHistoryEntry[]> {
    const url = toAbsoluteUrl(this.baseUrl, `/search-history?sessionId=${sessionId}`);
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }

    return response.json();
  }

  async clearSearchHistory(sessionId: string): Promise<void> {
    const url = toAbsoluteUrl(this.baseUrl, `/search-history?sessionId=${sessionId}`);
    const response = await fetch(url, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${await response.text()}`);
    }
  }
}

export interface SearchHistoryEntry {
  query: string;
  resultCount: number;
  timestamp: string;
}

export const advancedSearchService = new AdvancedSearchService();
