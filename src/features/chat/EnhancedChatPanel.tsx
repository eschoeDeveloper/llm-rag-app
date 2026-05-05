import React from "react";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { useRAGChat } from "../../shared/hooks/useRAGChat.ts";
import { usePromptEngine } from "../../shared/hooks/usePromptEngine.ts";
import { ModeValue } from "./types.ts";
import { ChatSidebar, SidebarTab } from "./components/ChatSidebar.tsx";
import { MessageList } from "./components/MessageList.tsx";
import { MessageComposer } from "./components/MessageComposer.tsx";
import { useThreadChat } from "./hooks/useThreadChat.ts";

export function EnhancedChatPanel({ base }: { base: string }) {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ModeValue>("chat");
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<SidebarTab>("chat");
  const [error, setError] = React.useState<string | null>(null);
  const [activeThread, setActiveThread] = React.useState<any>(null);
  const [threadsRefreshKey, setThreadsRefreshKey] = React.useState(0);

  const {
    messages,
    setMessages,
    loading,
    config,
    sessionId,
    sendMessage,
    clearMessages,
    loadHistory,
    cancelRequest,
    updateConfig,
  } = useRAGChat(base);

  const {
    selectedTemplate,
    setSelectedTemplate,
    customPrompt,
    setCustomPrompt,
    getTemplates,
  } = usePromptEngine();

  const refreshThreads = () => setThreadsRefreshKey((p) => p + 1);
  const threadChat = useThreadChat({ base, activeThread, sessionId, mode, config, setMessages, refreshThreads });

  // 일반 모드(useRAGChat) 와 스레드 모드(useThreadChat) 둘 중 하나만 동시에 동작 — 합쳐서 UI 전체에 반영
  const isBusy = loading || threadChat.sending;
  const boxRef = useScrollToBottom([messages, isBusy]);

  // typing indicator 는 "사용자 입력 후 ~ ASSISTANT 응답 시작 전" 구간에만 노출.
  // ASSISTANT 메시지가 화면에 등장한 시점부터는 그 메시지가 채워지는 모습이 보이므로 typing 중복.
  const lastMsg = messages[messages.length - 1];
  const showTyping = isBusy && (!lastMsg || lastMsg.role === "user");

  // 활성 모드에 따라 cancel 디스패치 (스레드 모드면 thread cancel, 아니면 RAG cancel)
  const cancelActive = React.useCallback(() => {
    if (activeThread) threadChat.cancel();
    else cancelRequest();
  }, [activeThread, threadChat, cancelRequest]);

  React.useEffect(() => () => cancelRequest(), [cancelRequest]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const message = input.trim();
    setInput("");

    try {
      // customPrompt 가 비어있으면 백엔드는 기본 SYSTEM_PROMPT 사용. 트림한 값만 전달.
      const effectiveCustomPrompt = customPrompt.trim() ? customPrompt.trim() : undefined;
      if (activeThread && sessionId) {
        await threadChat.send(message, effectiveCustomPrompt);
      } else {
        await sendMessage(message, mode, effectiveCustomPrompt);
      }
    } catch (err) {
      setError("메시지 전송 중 오류가 발생했습니다: " + (err as Error).message);
    }
  }

  async function handleThreadSelect(thread: any) {
    if (activeThread && activeThread.id === thread.id) return;
    setActiveThread(thread);
    if (thread.messages && thread.messages.length > 0) {
      setMessages(
        thread.messages.map((msg: any) => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
        })),
      );
    } else {
      setMessages([]);
    }
  }

  return (
    <div className="flex h-[calc(100vh-9rem)] bg-canvas">
      <ChatSidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        mode={mode}
        onModeChange={setMode}
        showAdvanced={showAdvanced}
        onToggleAdvanced={() => setShowAdvanced((v) => !v)}
        config={config}
        onConfigChange={updateConfig}
        selectedTemplate={selectedTemplate}
        onTemplateChange={setSelectedTemplate}
        templates={getTemplates()}
        customPrompt={customPrompt}
        onCustomPromptChange={setCustomPrompt}
        sessionId={sessionId}
        onLoadHistory={loadHistory}
        onClearMessages={clearMessages}
        base={base}
        onError={setError}
        onSearchResults={() => {}}
        onThreadSelect={handleThreadSelect}
        threadsRefreshKey={threadsRefreshKey}
        onRefreshThreads={refreshThreads}
        onDocumentUpload={() => {}}
      />

      <div className="flex-1 flex flex-col">
        <div className="bg-elevated border-b border-line-subtle p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold text-ink">
                {mode === "ask" ? "Ask 모드" : "Chat 모드"}
              </h3>
              <p className="text-xs text-ink-secondary">
                {mode === "ask" ? "컨텍스트 검색 없이 바로 질문" : "RAG 컨텍스트를 사용한 대화"}
              </p>
            </div>
            {isBusy && (
              <div className="flex items-center space-x-2 text-sm text-matcha">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-matcha"></div>
                <span>Processing…</span>
              </div>
            )}
          </div>
        </div>

        <MessageList messages={messages} scrollRef={boxRef} isAssistantTyping={showTyping} />

        <MessageComposer
          input={input}
          onInputChange={setInput}
          onSubmit={handleSubmit}
          onCancel={cancelActive}
          loading={isBusy}
          mode={mode as "ask" | "chat"}
          error={error}
          onClearError={() => setError(null)}
        />
      </div>
    </div>
  );
}
