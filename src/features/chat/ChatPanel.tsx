import React from "react";

import { Section } from "../../shared/ui/Section.tsx";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { postText } from "../../shared/api/http.ts";

import { Message, Modes, ModeValue } from "./types.ts";

export function ChatPanel({ base }: { base: string }) {
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [input, setInput] = React.useState("");
  const [mode, setMode] = React.useState<ModeValue>("ask");
  const [loading, setLoading] = React.useState(false);

  const boxRef = useScrollToBottom([messages]);
  const abortRef = React.useRef<AbortController | null>(null);

  // Mode 타입 가드: select 등 문자열 입력을 안전하게 좁히기
  const isModeValue = (v: string): v is ModeValue =>
    Modes.some((m) => m.value === v);

  // 언마운트/리렌더 정리: 진행 중 요청 취소
  React.useEffect(() => {
    return () => {
      abortRef.current?.abort();
      abortRef.current = null;
    };
  }, []);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;

    // 나의 메시지를 먼저 UI에 반영
    const me: Message = { role: "user", content: text, ts: Date.now() };
    setMessages((prev) => [...prev, me]);
    setInput("");

    // 이전 요청 취소
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const url = `${base}/${mode}`; // /ask 또는 /chat
      const replyText = await postText(url, { query: me.content }, controller.signal);

      const reply: Message = {
        role: "assistant",
        content: replyText,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, reply]);
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === "string"
          ? e
          : "Unexpected error";

      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: msg,
          ts: Date.now(),
          error: true,
        },
      ]);
    } finally {
      // 완료 후 현재 컨트롤러는 더이상 의미 없음
      if (abortRef.current === controller) {
        abortRef.current = null;
      }
      setLoading(false);
    }
  }

  // Ctrl/Cmd+Enter 로 전송 (선택 사항)
  const onTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      void send();
    }
    // Esc 로 진행중 요청 취소 (선택 사항)
    if (e.key === "Escape") {
      abortRef.current?.abort();
      abortRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Section title="Chat">
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
                  </div>
                </div>
              ))}
            </div>
          </div>

          <form
            className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-6"
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
          >
            <div className="md:col-span-5">
              <Textarea
                value={input}
                onChange={setInput}
                onKeyDown={onTextareaKeyDown}
                placeholder="Ask something…"
                rows={3}
                disabled={loading}
                aria-label="Message input"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="sr-only" htmlFor="mode-select">
                Mode
              </label>
              <select
                id="mode-select"
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
        </Section>
      </div>

      <div>
        <Section title="Debug">
          <div className="space-y-2 text-xs text-gray-600">
            <div>
              Base: <code className="rounded bg-gray-100 px-1">{base}</code>
            </div>
            <div>
              Mode: <code className="rounded bg-gray-100 px-1">{mode}</code>
            </div>
            <div>Messages: {messages.length}</div>
            <div>
              Loading:{" "}
              <code className="rounded bg-gray-100 px-1">
                {String(loading)}
              </code>
            </div>
          </div>
        </Section>
      </div>
    </div>
  );
}
