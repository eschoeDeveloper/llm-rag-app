import { useState, useCallback, useRef, useEffect } from 'react';
import { RAGService } from '../services/RAGService.ts';
import { Message, RAGConfig, SearchResult, ChatResponse } from '../types/prompt.ts';

// 세션 ID 생성 함수
const generateSessionId = () => {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
};

// localStorage에서 세션 ID를 가져오거나 새로 생성
const getOrCreateSessionId = () => {
  const stored = localStorage.getItem('rag_session_id');
  if (stored) {
    return stored;
  }
  const newSessionId = generateSessionId();
  localStorage.setItem('rag_session_id', newSessionId);
  return newSessionId;
};

export function useRAGChat(baseUrl?: string) {
  const [ragService] = useState(() => RAGService.getInstance());
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [config, setConfig] = useState<RAGConfig>(ragService.getConfig());
  const [sessionId, setSessionId] = useState<string>(() => getOrCreateSessionId()); // localStorage에서 세션 ID 가져오기
  const abortRef = useRef<AbortController | null>(null);
  
  // 세션 ID가 변경되었을 때 localStorage에 저장
  useEffect(() => {
    if (sessionId) {
      localStorage.setItem('rag_session_id', sessionId);
      console.log('Session ID updated:', sessionId);
    }
  }, [sessionId]);
  
  // baseUrl이 없으면 기본값 사용
  const effectiveBaseUrl = baseUrl || '';

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
        searchResults = await ragService.searchVectors(content, effectiveBaseUrl, controller.signal);
        setSearchResults(searchResults);
        
        // 검색 결과와 함께 채팅 (세션 ID 포함)
        response = await ragService.chatWithRAG(content, effectiveBaseUrl, searchResults, controller.signal, sessionId);
      } else {
        // 직접 질문 모드 (세션 ID 포함)
        response = await ragService.askWithoutRAG(content, effectiveBaseUrl, controller.signal, sessionId);
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
  }, [effectiveBaseUrl, loading, ragService, sessionId]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    setSearchResults([]);
    
    // 서버의 히스토리도 삭제
    if (sessionId) {
      try {
        await ragService.clearHistory(effectiveBaseUrl, sessionId);
      } catch (error) {
        console.error('Failed to clear server history:', error);
      }
    }
    
    // 세션 ID는 유지 (새로 생성하지 않음)
  }, [sessionId, effectiveBaseUrl, ragService]);

  // 히스토리 조회 기능
  const loadHistory = useCallback(async () => {
    if (!sessionId) return;
    
    try {
      const history = await ragService.getHistory(effectiveBaseUrl, sessionId);
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
  }, [sessionId, effectiveBaseUrl, ragService]);

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

  // 세션 ID 재설정 함수
  const resetSession = useCallback(() => {
    const newSessionId = generateSessionId();
    localStorage.setItem('rag_session_id', newSessionId);
    setSessionId(newSessionId);
    setMessages([]);
    setSearchResults([]);
  }, []);

  return {
    messages,
    setMessages,
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
    optimizeParameters,
    resetSession
  };
}

