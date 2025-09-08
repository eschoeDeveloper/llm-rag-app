import { RAGConfig, SearchResult, ChatResponse } from '../types/prompt.ts';

export class RAGService {
  private static instance: RAGService;
  private config: RAGConfig;

  static getInstance(): RAGService {
    if (!RAGService.instance) {
      RAGService.instance = new RAGService();
    }
    return RAGService.instance;
  }

  constructor() {
    this.config = {
      topK: 10,
      threshold: 0.7,
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
    baseUrl: string, 
    signal?: AbortSignal
  ): Promise<SearchResult[]> {
    try {
      const response = await fetch(`${baseUrl}/embeddings/search`, {
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
      return this.processSearchResults(data);
    } catch (error) {
      console.error('Vector search error:', error);
      throw error;
    }
  }

  async chatWithRAG(
    query: string,
    baseUrl: string,
    searchResults: SearchResult[],
    signal?: AbortSignal
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          searchResults,
          config: this.config
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Chat failed: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        content: data.content || data,
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

  async askWithoutRAG(
    query: string,
    baseUrl: string,
    signal?: AbortSignal
  ): Promise<ChatResponse> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`${baseUrl}/ask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query,
          config: this.config
        }),
        signal
      });

      if (!response.ok) {
        throw new Error(`Ask failed: ${response.status}`);
      }

      const data = await response.json();
      const processingTime = Date.now() - startTime;

      return {
        content: data.content || data,
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
        threshold: Math.max(this.config.threshold - 0.1, 0.3)
      };
    }

    return {};
  }
}
