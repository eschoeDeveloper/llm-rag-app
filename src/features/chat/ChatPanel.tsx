import React from "react";

import { Section } from "../../shared/ui/Section.tsx";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { Input } from "../../shared/ui/Input.tsx";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { useRAGChat } from "../../shared/hooks/useRAGChat.ts";
import { usePromptEngine } from "../../shared/hooks/usePromptEngine.ts";
import { Message, Modes, ModeValue } from "./types.ts";

export function ChatPanel({ base }: { base: string }) {
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ModeValue>("ask");
  const [showAdvanced, setShowAdvanced] = React.useState(false);

  const {
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
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
      <div className="lg:col-span-3">
        <Section title="Enhanced Chat">
          <div
            ref={boxRef}
            className="h-[420px] overflow-y-auto rounded-xl border bg-white p-4"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">
                No messages yet. Type below and send.
              </div>
            )}
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={m.ts + i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user"
                        ? "bg-blue-50"
                        : m.error
                        ? "bg-red-50"
                        : "bg-gray-100"
                    }`}
                  >
                    <div className="mb-1 text-[11px] uppercase tracking-wide opacity-60">
                      {m.role}
                    </div>
                    {m.content}
                    {m.metadata && (
                      <div className="mt-2 text-xs text-gray-500">
                        {m.metadata.tokens && `Tokens: ${m.metadata.tokens}`}
                        {m.metadata.processingTime && ` | Time: ${m.metadata.processingTime}ms`}
                        {m.metadata.searchResults && ` | Results: ${m.metadata.searchResults.length}`}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault();
              void handleSend();
            }}
          >
            <div className="md:col-span-5">
              <Textarea
                value={input}
                onChange={setInput}
                onKeyDown={handleKeyDown}
                placeholder="Ask something…"
                rows={3}
                disabled={loading}
                aria-label="Message input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <select
                className="rounded-xl border p-2 text-sm"
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

              <Button type="submit" disabled={loading || !input.trim()}>
                {loading ? "Sending…" : "Send"}
              </Button>
            </div>
          </form>

          <div className="mt-3 flex gap-2">
            <Button onClick={clearMessages} variant="outline" size="sm">
              Clear
            </Button>
            <Button 
              onClick={() => setShowAdvanced(!showAdvanced)} 
              variant="outline" 
              size="sm"
            >
              {showAdvanced ? "Hide" : "Show"} Advanced
            </Button>
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <Section title="Debug Info">
          <div className="space-y-2 text-xs text-gray-600">
            <div>Base: <code className="rounded bg-gray-100 px-1">{base}</code></div>
            <div>Mode: <code className="rounded bg-gray-100 px-1">{mode}</code></div>
            <div>Messages: {messages.length}</div>
            <div>Loading: <code className="rounded bg-gray-100 px-1">{String(loading)}</code></div>
            {searchResults.length > 0 && (
              <div>
                Search Quality: 
                <span className={`ml-1 px-1 rounded text-white text-xs ${
                  searchQuality.qualityRating === 'excellent' ? 'bg-green-500' :
                  searchQuality.qualityRating === 'good' ? 'bg-blue-500' :
                  searchQuality.qualityRating === 'fair' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}>
                  {searchQuality.qualityRating}
                </span>
              </div>
            )}
          </div>
        </Section>

        {showAdvanced && (
          <>
            <Section title="Prompt Settings">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Template</label>
                  <select
                    className="w-full rounded-xl border p-2 text-sm"
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
                  <label className="block text-sm font-medium mb-1">Custom Prompt</label>
                  <Textarea
                    value={customPrompt}
                    onChange={setCustomPrompt}
                    placeholder="Override template with custom prompt..."
                    rows={3}
                  />
                  {customPrompt && !promptValidation.valid && (
                    <div className="mt-1 text-xs text-red-600">
                      {promptValidation.errors.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            </Section>

            <Section title="RAG Config">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Top K</label>
                  <Input
                    type="number"
                    value={config.topK.toString()}
                    onChange={(value) => updateConfig({ topK: parseInt(value) || 10 })}
                    min="1"
                    max="50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Threshold</label>
                  <Input
                    type="number"
                    value={config.threshold.toString()}
                    onChange={(value) => updateConfig({ threshold: parseFloat(value) || 0.7 })}
                    min="0"
                    max="1"
                    step="0.1"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Temperature</label>
                  <Input
                    type="number"
                    value={config.temperature.toString()}
                    onChange={(value) => updateConfig({ temperature: parseFloat(value) || 0.7 })}
                    min="0"
                    max="2"
                    step="0.1"
                  />
                </div>
              </div>
            </Section>

            {searchResults.length > 0 && (
              <Section title="Search Results">
                <div className="space-y-2">
                  {searchResults.slice(0, 3).map((result, i) => (
                    <div key={i} className="rounded border p-2 text-xs">
                      <div className="font-medium">#{result.id}</div>
                      <div className="text-gray-600 line-clamp-2">{result.content}</div>
                      <div className="text-gray-500">Score: {result.score?.toFixed(3)}</div>
                    </div>
                  ))}
                  {searchResults.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{searchResults.length - 3} more results
                    </div>
                  )}
                </div>
              </Section>
            )}
          </>
        )}
      </div>
    </div>
  );
}