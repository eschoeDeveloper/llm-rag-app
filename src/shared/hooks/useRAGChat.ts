import { useState, useCallback, useRef, useEffect } from 'react';
import { RAGService } from '../services/RAGService.ts';
import { Message, RAGConfig, SearchResult, ChatResponse } from '../types/prompt.ts';

// 세션 ID 생성 함수
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

export function useRAGChat(baseUrl: string) {
  const [ragService] = useState(() => RAGService.getInstance());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [config, setConfig] = useState<RAGConfig>(ragService.getConfig());
  const [sessionId, setSessionId] = useState<string>(() => generateSessionId()); // 초기값으로 세션 ID 생성
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
        
        // 검색 결과와 함께 채팅 (세션 ID 포함)
        response = await ragService.chatWithRAG(content, baseUrl, searchResults, controller.signal, sessionId);
      } else {
        // 직접 질문 모드 (세션 ID 포함)
        response = await ragService.askWithoutRAG(content, baseUrl, controller.signal, sessionId);
      }

      // 세션 ID 업데이트 (응답에서 받은 세션 ID 사용)
      if (response.sessionId) {
        setSessionId(response.sessionId);
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response.content,
        timestamp: Date.now(),
        metadata: {
          ...response.metadata,
          searchResults: mode === 'chat' ? searchResults : undefined,
          sessionId: response.sessionId
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
  }, [baseUrl, loading, ragService, sessionId]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setSearchResults([]);
    
    // 서버의 히스토리도 삭제
    if (sessionId) {
      try {
        await ragService.clearHistory(baseUrl, sessionId);
      } catch (error) {
        console.error('Failed to clear server history:', error);
      }
    }
    
    // 새로운 세션 ID 생성
    setSessionId(generateSessionId());
  }, [sessionId, baseUrl, ragService]);

  // 히스토리 조회 기능
  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const history = await ragService.getHistory(baseUrl, sessionId);
      // 서버 히스토리를 로컬 메시지로 변환
      const historyMessages: Message[] = history.split('\n').filter(line => line.trim()).map(line => {
        if (line.startsWith('사용자: ')) {
          return {
            role: 'user' as const,
            content: line.replace('사용자: ', ''),
            timestamp: Date.now()
          };
        } else if (line.startsWith('AI: ')) {
          return {
            role: 'assistant' as const,
            content: line.replace('AI: ', ''),
            timestamp: Date.now()
          };
        }
        return null;
      }).filter(Boolean) as Message[];
      
      setMessages(historyMessages);
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }, [sessionId, baseUrl, ragService]);

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
    sessionId,
    sendMessage,
    clearMessages,
    loadHistory,
    cancelRequest,
    updateConfig,
    evaluateSearchQuality,
    optimizeParameters
  };
}

