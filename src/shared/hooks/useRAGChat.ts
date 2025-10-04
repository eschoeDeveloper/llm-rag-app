import { useState, useCallback, useRef } from 'react';
import { RAGService } from '../services/RAGService.ts';
import { Message, RAGConfig, SearchResult, ChatResponse } from '../types/prompt.ts';

export function useRAGChat(baseUrl: string) {
  const [ragService] = useState(() => RAGService.getInstance());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [config, setConfig] = useState<RAGConfig>(ragService.getConfig());
  const abortRef = useRef<AbortController | null>(null);

  const updateConfig = useCallback((updates: Partial<RAGConfig>) => {
    const newConfig = { ...config, ...updates };
    setConfig(newConfig);
    ragService.updateConfig(newConfig);
  }, [config, ragService]);

  const sendMessage = useCallback(async (
    content: string,
    mode: 'ask' | 'chat' = 'chat'
  ) => {
    if (!content.trim() || loading) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      role: 'user',
      content,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, userMessage]);

    // 이전 요청 취소
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      let response: ChatResponse;
      let searchResults: SearchResult[] = [];

      if (mode === 'chat') {
        // RAG 모드: 먼저 검색 수행
        searchResults = await ragService.searchVectors(content, baseUrl, controller.signal);
        setSearchResults(searchResults);
        
        // 검색 결과와 함께 채팅
        response = await ragService.chatWithRAG(content, baseUrl, searchResults, controller.signal);
      } else {
        // 직접 질문 모드
        response = await ragService.askWithoutRAG(content, baseUrl, controller.signal);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          searchResults: mode === 'chat' ? searchResults : undefined
        }
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: Message = {
        role: 'assistant',
        content: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: Date.now(),
        error: true
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }, [baseUrl, loading, ragService]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setSearchResults([]);
  }, []);

  const cancelRequest = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setLoading(false);
  }, []);

  const evaluateSearchQuality = useCallback(() => {
    return ragService.evaluateSearchQuality(searchResults);
  }, [ragService, searchResults]);

  const optimizeParameters = useCallback((feedback: 'positive' | 'negative') => {
    const optimization = ragService.optimizeSearchParameters('', searchResults, feedback);
    if (Object.keys(optimization).length > 0) {
      updateConfig(optimization);
    }
  }, [ragService, searchResults, updateConfig]);

  return {
    messages,
    loading,
    searchResults,
    config,
    sendMessage,
    clearMessages,
    cancelRequest,
    updateConfig,
    evaluateSearchQuality,
    optimizeParameters
  };
}

