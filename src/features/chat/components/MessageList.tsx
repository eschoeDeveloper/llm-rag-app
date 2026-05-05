import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Message = {
  role: string;
  content: string;
  timestamp?: number;
  error?: boolean;
  metadata?: {
    tokens?: number;
    processingTime?: number;
    searchResults?: unknown[];
    citations?: any[];
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
          {isUser ? (
            <div className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</div>
          ) : (
            <MarkdownContent text={m.content} />
          )}
          {m.metadata && <MessageMetadata meta={m.metadata} />}
        </div>
      </div>
    </div>
  );
}

/**
 * ASSISTANT 메시지 마크다운 렌더링.
 * GFM 지원 — 표, 체크박스, 자동 링크, ~~취소선~~.
 * 디자인 토큰(matcha 등) 적용 위해 컴포넌트 매핑 직접 정의.
 */
function MarkdownContent({ text }: { text: string }) {
  return (
    <div className="prose-rag text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-5 mb-2 space-y-1">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-5 mb-2 space-y-1">{children}</ol>,
          li: ({ children }) => <li className="leading-relaxed">{children}</li>,
          h1: ({ children }) => <h1 className="text-base font-semibold mt-2 mb-1">{children}</h1>,
          h2: ({ children }) => <h2 className="text-sm font-semibold mt-2 mb-1">{children}</h2>,
          h3: ({ children }) => <h3 className="text-sm font-semibold mt-1 mb-1">{children}</h3>,
          a: ({ href, children }) => (
            <a href={href} target="_blank" rel="noopener noreferrer"
               className="text-matcha-hover underline hover:text-matcha">{children}</a>
          ),
          code: ({ className, children }) => {
            const isBlock = className?.includes("language-");
            if (isBlock) {
              return (
                <pre className="bg-canvas border border-line-subtle rounded p-2 my-2 overflow-x-auto text-xs">
                  <code>{children}</code>
                </pre>
              );
            }
            return <code className="bg-muted px-1 py-0.5 rounded text-[0.85em]">{children}</code>;
          },
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-matcha pl-3 my-2 text-ink-secondary italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-2">
              <table className="text-xs border-collapse w-full">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="border border-line-subtle px-2 py-1 bg-muted font-semibold text-left">{children}</th>,
          td: ({ children }) => <td className="border border-line-subtle px-2 py-1">{children}</td>,
          hr: () => <hr className="my-3 border-line-subtle" />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

type Citation = {
  documentId?: string;
  chunkIndex?: number;
  title?: string;
  score?: number;
  content?: string;
};

function MessageMetadata({ meta }: { meta: NonNullable<Message["metadata"]> }) {
  const [openCitation, setOpenCitation] = React.useState<Citation | null>(null);
  const citations = (meta.citations as Citation[] | undefined) ?? [];

  return (
    <>
      <div className="mt-2 text-[11px] flex flex-wrap gap-1.5 text-ink-tertiary">
        {meta.tokens != null && <span className="px-1.5 py-0.5 rounded bg-muted">{meta.tokens} tokens</span>}
        {meta.processingTime != null && <span className="px-1.5 py-0.5 rounded bg-muted">{meta.processingTime}ms</span>}
        {citations.length > 0 && citations.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpenCitation(c)}
            className="px-1.5 py-0.5 rounded bg-matcha-soft text-matcha-hover hover:bg-matcha hover:text-ink-on-accent transition-colors cursor-pointer"
            title={c.title || `청크 ${c.chunkIndex}`}
          >
            [{i + 1}]
          </button>
        ))}
      </div>
      {openCitation && <CitationModal citation={openCitation} onClose={() => setOpenCitation(null)} />}
    </>
  );
}

/**
 * 인용 원본 청크 모달 — RAG citation provenance.
 * 사용자가 [근거 N] 칩을 클릭하면 해당 청크의 원본 content 와 메타를 노출.
 */
function CitationModal({ citation, onClose }: { citation: Citation; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      onClick={onClose}
    >
      <div
        className="bg-elevated border border-line rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 p-4 border-b border-line-subtle">
          <div className="min-w-0 flex-1">
            <div className="text-xs text-ink-tertiary mb-1">참조 청크</div>
            <h3 className="text-sm font-semibold text-ink truncate">
              {citation.title || `청크 #${citation.chunkIndex ?? 0}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-ink-tertiary hover:text-ink text-lg leading-none px-1">
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex flex-wrap gap-1.5 text-[10px] text-ink-tertiary mb-3">
            {citation.score != null && (
              <span className="px-1.5 py-0.5 rounded bg-matcha-soft text-matcha-hover">
                score {citation.score.toFixed(3)}
              </span>
            )}
            {citation.documentId && (
              <span className="px-1.5 py-0.5 rounded bg-muted">
                doc {String(citation.documentId).substring(0, 8)}…
              </span>
            )}
            {citation.chunkIndex != null && (
              <span className="px-1.5 py-0.5 rounded bg-muted">chunk {citation.chunkIndex}</span>
            )}
          </div>
          <p className="text-sm text-ink whitespace-pre-wrap leading-relaxed">
            {citation.content || "(원본 content 없음)"}
          </p>
        </div>
      </div>
    </div>
  );
}
