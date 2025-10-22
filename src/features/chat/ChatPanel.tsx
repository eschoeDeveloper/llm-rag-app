import React from "react";

import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { Input } from "../../shared/ui/Input.tsx";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { useRAGChat } from "../../shared/hooks/useRAGChat.ts";
import { usePromptEngine } from "../../shared/hooks/usePromptEngine.ts";
import { Modes, ModeValue } from "./types.ts";
import { AdvancedSearchPanel } from "../search/AdvancedSearchPanel";
import { ConversationThreadPanel } from "../conversation/ConversationThreadPanel";
import { DocumentUploadPanel } from "../document/DocumentUploadPanel";

export function ChatPanel({ base }: { base: string }) {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ModeValue>("ask");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'chat' | 'search' | 'threads' | 'documents'>('chat');
  const [error, setError] = React.useState<string | null>(null);

  const {
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
    // optimizeParameters
  } = useRAGChat(base);

  const {
    selectedTemplate,
    setSelectedTemplate,
    customPrompt,
    setCustomPrompt,
    getTemplates,
    renderPrompt,
    validatePrompt
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

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;

    // 프롬프트 렌더링
    const renderedPrompt = renderPrompt({
      userQuery: text,
      searchResults: mode === 'chat' ? searchResults : undefined,
      conversationHistory: messages.slice(-5)
    });

    setInput("");
    await sendMessage(renderedPrompt, mode);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void handleSend();
    }
    if (e.key === "Escape") {
      cancelRequest();
    }
  };

  const searchQuality = evaluateSearchQuality();
  const promptValidation = validatePrompt(customPrompt);

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-4 p-8">
      <div className="lg:col-span-3">
        <div className="mb-6">
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent mb-2">
            💬 AI Chat Interface
          </h2>
          <p className="text-gray-600">Experience intelligent conversations with advanced RAG capabilities</p>
        </div>
        
        <div
          ref={boxRef}
          className="h-[500px] overflow-y-auto rounded-3xl border-2 border-gray-100 bg-gradient-to-b from-white to-gray-50 p-6 shadow-inner"
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
          <div className="space-y-4">
            {messages.map((m, i) => (
              <div key={m.ts + i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
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
        </div>

        {/* Input Form */}
        <form
          className="mt-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg"
          onSubmit={(e) => {
            e.preventDefault();
            void handleSend();
          }}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-6">
            <div className="lg:col-span-4">
              <Textarea
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask me anything... I'm powered by advanced RAG technology! 🚀"
                rows={3}
                disabled={loading}
                className="text-lg py-4 px-6 rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200 resize-none"
              />
            </div>

            <div className="lg:col-span-2 flex flex-col gap-3">
              <select
                className="rounded-2xl border-2 border-gray-200 p-3 text-sm font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                value={mode}
                onChange={(e) => {
                  const v = e.target.value;
                  if (isModeValue(v)) setMode(v);
                }}
                disabled={loading}
                aria-label="Mode selector"
              >
                {Modes.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>

              <Button 
                type="submit" 
                disabled={loading || !input.trim()}
                variant="primary"
                size="lg"
                className="rounded-2xl font-semibold transition-all duration-200 hover:scale-105 disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Sending...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Send <span className="text-lg">🚀</span>
                  </span>
                )}
              </Button>
            </div>
          </div>
        </form>

        {/* Action Buttons */}
        <div className="mt-4 flex gap-3 flex-wrap">
          <Button 
            onClick={clearMessages} 
            variant="outline" 
            size="md"
            className="rounded-2xl font-medium transition-all duration-200 hover:scale-105"
          >
            🗑️ Clear Chat
          </Button>
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
            onClick={() => setShowAdvanced(!showAdvanced)} 
            variant="outline" 
            size="md"
            className="rounded-2xl font-medium transition-all duration-200 hover:scale-105"
          >
            {showAdvanced ? "🔽 Hide" : "🔧 Show"} Advanced
          </Button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="space-y-6">
        {/* Status Panel */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            📊 Status Dashboard
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Connection</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Connected</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Mode</span>
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {mode}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Messages</span>
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {messages.length}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Session</span>
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                {sessionId ? sessionId.substring(0, 8) + '...' : 'New'}
              </span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-600">Status</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                loading 
                  ? 'bg-yellow-100 text-yellow-700' 
                  : 'bg-green-100 text-green-700'
              }`}>
                {loading ? 'Processing...' : 'Ready'}
              </span>
            </div>
            
            {searchResults.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-600">Search Quality</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                    searchQuality.qualityRating === 'excellent' ? 'bg-green-500' :
                    searchQuality.qualityRating === 'good' ? 'bg-blue-500' :
                    searchQuality.qualityRating === 'fair' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}>
                    {searchQuality.qualityRating}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {showAdvanced && (
          <>
            {/* Prompt Settings */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                🧠 Prompt Settings
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Template</label>
                  <select
                    className="w-full rounded-2xl border-2 border-gray-200 p-3 text-sm font-medium focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                    value={selectedTemplate}
                    onChange={(e) => setSelectedTemplate(e.target.value)}
                  >
                    {getTemplates().map((template) => (
                      <option key={template.id} value={template.id}>
                        {template.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Custom Prompt</label>
                  <Textarea
                    value={customPrompt}
                    onChange={setCustomPrompt}
                    onKeyDown={() => {}}
                    placeholder="Override template with custom prompt..."
                    rows={3}
                    className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                  {promptValidation && !promptValidation.valid && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
                      {promptValidation.errors?.join(', ') || '유효하지 않은 프롬프트입니다.'}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RAG Configuration */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                ⚙️ RAG Configuration
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Top K Results</label>
                  <Input
                    type="number"
                    value={config.topK.toString()}
                    onChange={(value) => updateConfig({ topK: parseInt(value) || 10 })}
                    min="1"
                    max="50"
                    className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Similarity Threshold</label>
                  <Input
                    type="number"
                    value={config.threshold.toString()}
                    onChange={(value) => updateConfig({ threshold: parseFloat(value) || 0.7 })}
                    min="0"
                    max="1"
                    step="0.1"
                    className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Temperature</label>
                  <Input
                    type="number"
                    value={config.temperature.toString()}
                    onChange={(value) => updateConfig({ temperature: parseFloat(value) || 0.7 })}
                    min="0"
                    max="2"
                    step="0.1"
                    className="rounded-2xl border-2 border-gray-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  🔍 Search Results
                </h3>
                <div className="space-y-3">
                  {searchResults.slice(0, 3).map((result, i) => (
                    <div key={i} className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-sm text-gray-800">#{result.id}</span>
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {result.score?.toFixed(3)}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                        {result.content}
                      </div>
                    </div>
                  ))}
                  {searchResults.length > 3 && (
                    <div className="text-center">
                      <span className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        +{searchResults.length - 3} more results
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}