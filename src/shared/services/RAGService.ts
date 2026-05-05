import { RAGConfig, SearchResult, ChatResponse } from '../types/prompt.ts';
import { toAbsoluteUrl } from '../utils/urlUtils.ts';

export class RAGService {
  private static instance: RAGService;
  private config: RAGConfig;
  private baseUrl: string = '/api';

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  constructor() {
    this.config = {
      topK: 10,
      threshold: 0.1,
      maxTokens: 4000,
      temperature: 0.7,
      searchMode: 'similarity'
    };
  }

  getConfig(): RAGConfig {
    return { ...this.config };
  }

  updateConfig(updates: Partial<RAGConfig>): void {
    this.config = { ...this.config, ...updates };
  }

  async searchVectors(
    query: string, 
    baseUrl?: string, 
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    try {
      const url = baseUrl || this.baseUrl;
      const fullUrl = toAbsoluteUrl(url, '/embeddings/search');
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          topK: this.config.topK,
          threshold: this.config.threshold
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      // SearchResponse 형식 처리
      if (data.results && Array.isArray(data.results)) {
        return this.processSearchResults(data.results);
      } else {
        return this.processSearchResults(data);
      }
    } catch (error) {
      console.error('Vector search error:', error);
      throw error;
    }
  }

  async chatWithRAG(
    query: string,
    baseUrl: string,
    searchResults: SearchResult[],
    signal?: AbortSignal,
    sessionId?: string | null,
    customPrompt?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const url = baseUrl || this.baseUrl;
      const fullUrl = toAbsoluteUrl(url, '/chat');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }


      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          searchResults,
          config: this.config,
          sessionId,
          customPrompt: customPrompt || undefined
        }),
        signal
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RAGService] chatWithRAG - Error response body:', errorText);
        throw new Error(`Chat failed: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      const responseSessionId = response.headers.get('X-Session-ID') || data.sessionId;

      return {
        content: data.content || data,
        sessionId: responseSessionId,
        metadata: {
          model: data.model || 'unknown',
          tokens: data.tokens || 0,
          searchResults,
          processingTime
        }
      };
    } catch (error) {
      console.error('RAG chat error:', error);
      throw error;
    }
  }

  /**
   * 스트리밍 RAG 채팅 — SSE 응답을 토큰 단위로 콜백 호출.
   *
   * 백엔드 이벤트 형식:
   *   data: {"type":"meta","citations":[...],"model":"..."}
   *   data: {"type":"delta","content":"안녕"}
   *   data: {"type":"done"}
   *   data: {"type":"error","message":"..."}
   *
   * fetch + ReadableStream 직접 파싱 — EventSource 는 GET 만 지원해서 사용 불가.
   */
  async chatStream(
    query: string,
    baseUrl: string,
    callbacks: {
      onMeta?: (meta: { citations?: any[]; model?: string; retrievalEmpty?: boolean }) => void;
      onDelta: (token: string) => void;
      onDone?: () => void;
      onError?: (message: string) => void;
    },
    signal?: AbortSignal,
    sessionId?: string | null,
    customPrompt?: string,
  ): Promise<void> {
    const url = baseUrl || this.baseUrl;
    const fullUrl = toAbsoluteUrl(url, '/chat/stream');

    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (sessionId) headers['X-Session-ID'] = sessionId;

    const response = await fetch(fullUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        query,
        config: this.config,
        sessionId,
        customPrompt: customPrompt || undefined,
      }),
      signal,
    });

    if (!response.ok || !response.body) {
      throw new Error(`Stream failed: ${response.status} ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // SSE 이벤트는 \n\n 으로 구분
        let idx;
        while ((idx = buffer.indexOf('\n\n')) >= 0) {
          const block = buffer.slice(0, idx);
          buffer = buffer.slice(idx + 2);

          // data: 라인들 합치기
          let data = '';
          for (const line of block.split('\n')) {
            if (line.startsWith('data:')) {
              data += line.slice(5).trim();
            }
          }
          if (!data) continue;

          try {
            const event = JSON.parse(data);
            if (event.type === 'meta') {
              callbacks.onMeta?.(event);
            } else if (event.type === 'delta') {
              callbacks.onDelta(event.content ?? '');
            } else if (event.type === 'done') {
              callbacks.onDone?.();
              return;
            } else if (event.type === 'error') {
              callbacks.onError?.(event.message ?? 'unknown stream error');
              return;
            }
          } catch (e) {
            // JSON 파싱 실패 — 무시
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  async askWithoutRAG(
    query: string,
    baseUrl: string,
    signal?: AbortSignal,
    sessionId?: string | null,
    customPrompt?: string
  ): Promise<ChatResponse> {
    const startTime = Date.now();

    try {
      const url = baseUrl || this.baseUrl;
      const fullUrl = toAbsoluteUrl(url, '/ask');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (sessionId) {
        headers['X-Session-ID'] = sessionId;
      }


      const response = await fetch(fullUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          query,
          config: this.config,
          sessionId,
          customPrompt: customPrompt || undefined
        }),
        signal
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('[RAGService] askWithoutRAG - Error response body:', errorText);
        throw new Error(`Ask failed: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;
      const responseSessionId = response.headers.get('X-Session-ID') || data.sessionId;

      return {
        content: data.content || data,
        sessionId: responseSessionId,
        metadata: {
          model: data.model || 'unknown',
          tokens: data.tokens || 0,
          processingTime
        }
      };
    } catch (error) {
      console.error('Direct ask error:', error);
      throw error;
    }
  }

  private processSearchResults(data: any[]): SearchResult[] {
    if (!Array.isArray(data)) {
      return [];
    }

    return data.map((item, index) => ({
      id: item.id || `result_${index}`,
      content: item.content || item.text || '',
      score: item.score || item.similarity || 0,
      metadata: item.metadata || {},
      source: item.source || item.url || 'Unknown'
    }));
  }

  evaluateSearchQuality(results: SearchResult[]): {
    averageScore: number;
    highQualityCount: number;
    qualityRating: 'poor' | 'fair' | 'good' | 'excellent';
  } {
    if (!results.length) {
      return {
        averageScore: 0,
        highQualityCount: 0,
        qualityRating: 'poor'
      };
    }

    const scores = results.map(r => r.score);
    const averageScore = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    const highQualityCount = scores.filter(score => score > 0.8).length;
    
    let qualityRating: 'poor' | 'fair' | 'good' | 'excellent';
    if (averageScore > 0.8) qualityRating = 'excellent';
    else if (averageScore > 0.6) qualityRating = 'good';
    else if (averageScore > 0.4) qualityRating = 'fair';
    else qualityRating = 'poor';

    return {
      averageScore,
      highQualityCount,
      qualityRating
    };
  }

  optimizeSearchParameters(
    query: string,
    results: SearchResult[],
    feedback: 'positive' | 'negative'
  ): Partial<RAGConfig> {
    const quality = this.evaluateSearchQuality(results);
    
    if (feedback === 'positive' && quality.qualityRating === 'excellent') {
      // 현재 설정이 좋으므로 유지
      return {};
    }

    if (feedback === 'negative' || quality.qualityRating === 'poor') {
      // 검색 파라미터 조정
      return {
        topK: Math.min(this.config.topK + 5, 20),
        threshold: Math.max(this.config.threshold - 0.1, 0.1)
      };
    }

    return {};
  }

  // 히스토리 조회
  async getHistory(baseUrl: string, sessionId: string): Promise<string> {
    try {
      const url = toAbsoluteUrl(baseUrl, '/history');
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-Session-ID': sessionId }
      });

      if (!response.ok) {
        throw new Error(`History fetch failed: ${response.status}`);
      }

      const data = await response.json();
      return data.history || '대화 히스토리가 없습니다.';
    } catch (error) {
      console.error('History fetch error:', error);
      throw error;
    }
  }

  // 히스토리 삭제
  async clearHistory(baseUrl: string, sessionId: string): Promise<void> {
    try {
      const url = toAbsoluteUrl(baseUrl, '/history');
      const response = await fetch(url, {
        method: 'DELETE',
        headers: { 'X-Session-ID': sessionId }
      });

      if (!response.ok) {
        throw new Error(`History clear failed: ${response.status}`);
      }
    } catch (error) {
      console.error('History clear error:', error);
      throw error;
    }
  }

  // 히스토리 개수 조회
  async getHistoryCount(baseUrl: string, sessionId: string): Promise<number> {
    try {
      const url = toAbsoluteUrl(baseUrl, '/history/count');
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'X-Session-ID': sessionId }
      });

      if (!response.ok) {
        throw new Error(`History count fetch failed: ${response.status}`);
      }

      const data = await response.json();
      return data.count || 0;
    } catch (error) {
      console.error('History count fetch error:', error);
      throw error;
    }
  }
}

