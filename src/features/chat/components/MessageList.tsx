import React from "react";

type Message = {
  role: string;
  content: string;
  timestamp?: number;
  error?: boolean;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    searchResults?: unknown[];
  };
};

type Props = {
  messages: Message[];
  scrollRef: React.RefObject<HTMLDivElement>;
  isAssistantTyping?: boolean;
};

export function MessageList({ messages, scrollRef, isAssistantTyping }: Props) {
  return (
    <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4" aria-live="polite">
      {messages.length === 0 && !isAssistantTyping && (
        <div className="flex flex-col items-center justify-center h-full text-center">
          <h3 className="text-base font-semibold text-ink mb-2">대화를 시작하세요</h3>
          <p className="text-sm text-ink-tertiary max-w-sm">
            질문을 입력하거나 문서를 업로드해 컨텍스트 기반으로 대화할 수 있습니다.
          </p>
        </div>
      )}

      {messages.map((m, i) => (
        <MessageBubble key={m.timestamp ? `${m.timestamp}-${i}` : `m-${i}`} message={m} />
      ))}

      {isAssistantTyping && <TypingBubble />}
    </div>
  );
}

function TypingBubble() {
  return (
    <div className="flex justify-start" aria-label="응답 생성 중">
      <div className="flex items-start gap-3 max-w-[85%]">
        <div className="w-7 h-7 rounded flex items-center justify-center text-xs font-semibold shrink-0 bg-muted text-ink-secondary">
          A
        </div>
        <div className="rounded-md px-3.5 py-3 bg-elevated border border-line-subtle">
          <div className="flex gap-1.5 items-center">
            <span className="w-1.5 h-1.5 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="w-1.5 h-1.5 rounded-full bg-ink-tertiary animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message: m }: { message: Message }) {
  const isUser = m.role === "user";
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={`flex items-start gap-3 max-w-[85%] ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        <div className={`w-7 h-7 rounded flex items-center justify-center text-xs font-semibold shrink-0 ${
          isUser ? "bg-matcha text-ink-on-accent" : "bg-muted text-ink-secondary"
        }`}>
          {isUser ? "U" : "A"}
        </div>

        <div className={`rounded-md px-3.5 py-2.5 ${
          isUser
            ? "bg-matcha-soft text-ink"
            : m.error
            ? "bg-soft-sand border border-line text-ink"
            : "bg-elevated border border-line-subtle text-ink"
        }`}>
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
          {m.metadata && <MessageMetadata meta={m.metadata} />}
        </div>
      </div>
    </div>
  );
}

function MessageMetadata({ meta }: { meta: NonNullable<Message["metadata"]> }) {
  return (
    <div className="mt-2 text-[11px] flex flex-wrap gap-1.5 text-ink-tertiary">
      {meta.tokens != null && <span className="px-1.5 py-0.5 rounded bg-muted">{meta.tokens} tokens</span>}
      {meta.processingTime != null && <span className="px-1.5 py-0.5 rounded bg-muted">{meta.processingTime}ms</span>}
      {meta.searchResults && (
        <span className="px-1.5 py-0.5 rounded bg-muted">{meta.searchResults.length} results</span>
      )}
    </div>
  );
}
