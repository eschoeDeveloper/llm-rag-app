import React from "react";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { useRAGChat } from "../../shared/hooks/useRAGChat.ts";
import { usePromptEngine } from "../../shared/hooks/usePromptEngine.ts";
import { Modes, ModeValue } from "./types.ts";
import { AdvancedSearchPanel } from "../search/AdvancedSearchPanel.tsx";
import { ConversationThreadPanel } from "../conversation/ConversationThreadPanel.tsx";
import { DocumentUploadPanel } from "../document/DocumentUploadPanel.tsx";
import { conversationThreadService } from "../../shared/services/ConversationThreadService.ts";
import { RAGService } from "../../shared/services/RAGService.ts";

export function EnhancedChatPanel({ base }: { base: string }) {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ModeValue>("ask");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'search' | 'threads' | 'documents'>('chat');
  const [error, setError] = React.useState<string | null>(null);
  const [activeThread, setActiveThread] = React.useState<any>(null);
  
  // RAG 서비스 인스턴스
  const ragService = React.useMemo(() => RAGService.getInstance(), []);

  const {
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
  } = useRAGChat(base);

  const {
    selectedTemplate,
    setSelectedTemplate,
    customPrompt,
    setCustomPrompt,
    getTemplates,
    renderPrompt,
    // validatePrompt - not used to avoid object rendering issues
  } = usePromptEngine();

  const boxRef = useScrollToBottom([messages]);

  // Mode 타입 가드
  const isModeValue = (v: string): v is ModeValue =>
    Modes.some((m) => m.value === v);

  // 언마운트 시 요청 취소
  React.useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");

    try {
      if (activeThread && sessionId) {
        // 스레드 모드: 로컬 상태만 사용 (임시 해결책)
        console.log('Using thread mode - Thread ID:', activeThread.id);
        
        // 1. 사용자 메시지를 스레드에 저장
        await conversationThreadService.addMessage(activeThread.id, {
          content: message,
          role: 'USER'
        }, sessionId);
        
        // 2. LLM API 호출
        const apiUrl = `${base}/ask`;
        console.log('[EnhancedChatPanel] Thread mode - base:', base);
        console.log('[EnhancedChatPanel] Thread mode - Full API URL:', apiUrl);
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            query: message,
            provider: 'openai',
            model: 'gpt-4o-mini'
          })
        });
        
        if (response.ok) {
          const responseText = await response.text();
          
          // 3. 어시스턴트 메시지를 스레드에 저장
          await conversationThreadService.addMessage(activeThread.id, {
            content: responseText || '응답을 받을 수 없습니다.',
            role: 'ASSISTANT'
          }, sessionId);
        } else {
          // 오류 메시지를 스레드에 저장
          await conversationThreadService.addMessage(activeThread.id, {
            content: '죄송합니다. 응답을 생성하는 중 오류가 발생했습니다.',
            role: 'ASSISTANT'
          }, sessionId);
        }
        
        // 4. 스레드에서 메시지 다시 로드하여 화면에 표시
        const updatedThread = await conversationThreadService.getThread(activeThread.id, sessionId);
        if (updatedThread && updatedThread.messages) {
          const loadedMessages = updatedThread.messages.map((msg: any) => ({
            role: msg.role.toLowerCase(),
            content: msg.content,
            timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()
          }));
          setMessages(loadedMessages);
        }
        
        // 5. 스레드 목록 새로고침 (메시지 개수 업데이트)
        refreshThreads();
        
      } else {
        // 일반 채팅 모드
        console.log('Using normal chat mode');
        await sendMessage(message, mode);
      }
    } catch (error) {
      setError('메시지 전송 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleSearchResults = (results: any[]) => {
    // 검색 결과를 채팅에 통합하는 로직
    console.log('Search results:', results);
  };

  const handleThreadSelect = async (thread: any) => {
    try {
      console.log('Selected thread:', thread);
      
      // 이미 같은 스레드가 선택되어 있다면 메시지 로드 생략
      if (activeThread && activeThread.id === thread.id) {
        console.log('Same thread already selected, skipping message reload');
        return;
      }
      
      // 활성 스레드 설정
      setActiveThread(thread);
      
      // 스레드의 메시지들을 채팅에 로드
      if (thread.messages && thread.messages.length > 0) {
        const loadedMessages = thread.messages.map((msg: any) => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now()
        }));
        
        setMessages(loadedMessages);
        console.log('Loaded messages:', loadedMessages.length);
      } else {
        // 메시지가 없는 경우 빈 배열로 초기화
        setMessages([]);
        console.log('No messages in thread');
      }
    } catch (error) {
      console.error('Error loading thread messages:', error);
      setError('스레드 메시지를 불러오는 중 오류가 발생했습니다.');
    }
  };

  const handleDocumentUpload = (document: any) => {
    // 업로드된 문서 정보를 표시하는 로직
    console.log('Document uploaded:', document);
  };

  const [threadsRefreshKey, setThreadsRefreshKey] = React.useState(0);
  
  const refreshThreads = () => {
    console.log('Refreshing threads, current key:', threadsRefreshKey);
    setThreadsRefreshKey(prev => prev + 1);
  };

  // Removed prompt validation to avoid production build issues

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Left Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">RAG Chat</h2>
          <p className="text-sm text-gray-600">Advanced AI Assistant</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex">
            {[
              { id: 'chat', label: '💬 채팅', icon: '💬' },
              { id: 'search', label: '🔍 검색', icon: '🔍' },
              { id: 'threads', label: '🧵 스레드', icon: '🧵' },
              { id: 'documents', label: '📄 문서', icon: '📄' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 px-3 py-2 text-xs font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-500'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'chat' && (
            <div className="space-y-4">
              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">모드</label>
                <div className="flex space-x-2">
                  {Modes.map((m) => (
                    <Button
                      key={m.value}
                      onClick={() => setMode(m.value)}
                      variant={mode === m.value ? "default" : "outline"}
                      size="sm"
                      className="flex-1"
                    >
                      {m.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Advanced Settings */}
              <div className="space-y-2">
                <Button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  {showAdvanced ? '고급 설정 숨기기' : '고급 설정 보기'}
                </Button>
              </div>

              {showAdvanced && (
                <div className="space-y-3 p-3 bg-gray-50 rounded-lg">
                  {/* RAG Config */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">RAG 설정</label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600">Top K</label>
                        <input
                          type="number"
                          value={config.topK}
                          onChange={(e) => updateConfig({ topK: parseInt(e.target.value) || 5 })}
                          className="w-16 text-xs border rounded px-2 py-1"
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <label className="text-xs text-gray-600">Threshold</label>
                        <input
                          type="number"
                          step="0.1"
                          value={config.threshold}
                          onChange={(e) => updateConfig({ threshold: parseFloat(e.target.value) || 0.1 })}
                          className="w-16 text-xs border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Prompt Template */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">프롬프트 템플릿</label>
                    <select
                      value={selectedTemplate}
                      onChange={(e) => setSelectedTemplate(e.target.value)}
                      className="w-full text-xs border rounded px-2 py-1"
                    >
                      {getTemplates().map((template) => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Custom Prompt */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">커스텀 프롬프트</label>
                    <Textarea
                      value={customPrompt}
                      onChange={setCustomPrompt}
                      onKeyDown={() => {}}
                      placeholder="커스텀 프롬프트를 입력하세요..."
                      className="w-full text-xs"
                      rows={3}
                    />
                    {/* Validation removed to fix production build issue */}
                  </div>
                </div>
              )}

              {/* Session Info */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Session</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                    {sessionId ? sessionId.substring(0, 8) + '...' : 'New'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <Button
                  onClick={loadHistory}
                  variant="outline"
                  size="md"
                  disabled={!sessionId}
                  className="rounded-2xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  📜 Load History
                </Button>
                <Button
                  onClick={clearMessages}
                  variant="outline"
                  size="md"
                  className="rounded-2xl font-medium transition-all duration-200 hover:scale-105"
                >
                  🗑️ Clear Chat
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'search' && (
            <AdvancedSearchPanel
              sessionId={sessionId}
              baseUrl={base}
              onSearchResults={handleSearchResults}
              onError={setError}
            />
          )}

          {activeTab === 'threads' && (
            <div>
              <div className="mb-2 text-xs text-gray-500">
                Session ID: {sessionId}
              </div>
              <ConversationThreadPanel
                key={threadsRefreshKey}
                sessionId={sessionId}
                onThreadSelect={handleThreadSelect}
                onError={setError}
                refreshKey={threadsRefreshKey}
              />
              <div className="mt-4">
                <Button
                  onClick={refreshThreads}
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  🔄 스레드 목록 새로고침
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <DocumentUploadPanel
              sessionId={sessionId}
              onUploadComplete={handleDocumentUpload}
              onError={setError}
            />
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">
                {mode === 'ask' ? '💬 Ask Mode' : '🔍 Chat Mode'}
              </h3>
              <p className="text-sm text-gray-600">
                {mode === 'ask' 
                  ? 'Direct questions without context search'
                  : 'Contextual conversations with RAG'
                }
              </p>
            </div>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span>Processing...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages Area */}
        <div
          ref={boxRef}
          className="flex-1 overflow-y-auto p-4 space-y-4"
          aria-live="polite"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Ready to chat!</h3>
              <p className="text-gray-500 max-w-sm">
                Start a conversation with our AI assistant. Ask questions, get insights, or explore topics with advanced RAG capabilities.
              </p>
            </div>
          )}
          
          {messages.map((m, i) => (
            <div key={m.timestamp ? `${m.timestamp}-${i}` : `message-${i}`} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`flex items-start gap-3 max-w-[85%] ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                {/* Avatar */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  m.role === "user" 
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white" 
                    : "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
                }`}>
                  {m.role === "user" ? "👤" : "🤖"}
                </div>
                
                {/* Message bubble */}
                <div className={`rounded-2xl px-4 py-3 shadow-sm ${
                  m.role === "user"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                    : m.error
                    ? "bg-gradient-to-r from-red-100 to-red-50 border border-red-200 text-red-800"
                    : "bg-white border border-gray-200 text-gray-800"
                }`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content}
                  </div>
                  {m.metadata && (
                    <div className={`mt-2 text-xs flex flex-wrap gap-2 ${
                      m.role === "user" ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {m.metadata.tokens && (
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          📊 {m.metadata.tokens} tokens
                        </span>
                      )}
                      {m.metadata.processingTime && (
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          ⏱️ {m.metadata.processingTime}ms
                        </span>
                      )}
                      {m.metadata.searchResults && (
                        <span className="bg-white/20 px-2 py-1 rounded-full">
                          🔍 {m.metadata.searchResults.length} results
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <span className="text-red-600 mr-2">⚠️</span>
                <span className="text-red-800 text-sm">{error}</span>
                <button
                  onClick={() => setError(null)}
                  className="ml-auto text-red-600 hover:text-red-800"
                >
                  ✕
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex space-x-3">
            <div className="flex-1">
              <Textarea
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === "ask"
                    ? "Ask a direct question..."
                    : "Start a conversation with context..."
                }
                className="w-full resize-none"
                rows={3}
                disabled={loading}
              />
            </div>
            <div className="flex flex-col space-y-2">
              <Button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 py-3 rounded-2xl font-medium transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Sending..." : "Send"}
              </Button>
              {loading && (
                <Button
                  type="button"
                  onClick={cancelRequest}
                  variant="outline"
                  size="sm"
                  className="px-4 py-2 rounded-xl"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
