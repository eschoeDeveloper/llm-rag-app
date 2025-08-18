import React from "react";
import { Section } from "../../shared/ui/Section.tsx";
import { Textarea } from "../../shared/ui/Textarea.tsx";
import { Button } from "../../shared/ui/Button.tsx";
import { useScrollToBottom } from "../../shared/hooks/useScrollToBottom.ts";
import { postText } from "../../shared/api/http.ts";
import type { Message } from "./types";

const MODES = [
  { value: "ask", label: "ASK" },
  { value: "chat", label: "CHAT" },
] as const;

export function ChatPanel({ base }: { base: string }) {
  const [messages, setMessages] = React.useState([] as Message[]);
  const [input, setInput] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [mode, setMode] = React.useState("ask" as (typeof MODES)[number]["value"]);
  const boxRef = useScrollToBottom([messages]);
  const abortRef = React.useRef(null as AbortController | null);

  async function send() {
    if (!input.trim()) return;
    const me: Message = { role: "user", content: input, ts: Date.now() };
    setMessages((m) => [...m, me]);
    setInput("");

    // Cancel previous in-flight request if any
    abortRef.current?.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    try {
      const url = `${base}/${mode}`; // /ask or /chat
      const replyText = await postText(url, { query: me.content }, abortRef.current.signal);
      const reply: Message = { role: "assistant", content: replyText, ts: Date.now() };
      setMessages((m) => [...m, reply]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: String(e?.message ?? e), ts: Date.now(), error: true },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Section title="Chat">
          <div ref={boxRef} className="h-[420px] overflow-y-auto rounded-xl border bg-white p-4">
            {messages.length === 0 && (
              <div className="text-sm text-gray-500">No messages yet. Type below and send.</div>
            )}
            <div className="space-y-3">
              {messages.map((m, i) => (
                <div key={i} className={m.role === "user" ? "text-right" : "text-left"}>
                  <div
                    className={`inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                      m.role === "user" ? "bg-blue-50" : m.error ? "bg-red-50" : "bg-gray-100"
                    }`}
                  >
                    <div className="mb-1 text-[11px] uppercase tracking-wide opacity-60">{m.role}</div>
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
              <Textarea value={input} onChange={setInput} placeholder="Ask something…" rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <select
                className="rounded-xl border p-2 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value as any)}
              >
                {MODES.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
              <Button type="submit" disabled={loading}>{loading ? "Sending…" : "Send"}</Button>
            </div>
          </form>
        </Section>
      </div>

      <div>
        <Section title="Debug">
          <div className="text-xs text-gray-600 space-y-2">
            <div>
              Base: <code className="rounded bg-gray-100 px-1">{base}</code>
            </div>
            <div>
              Mode: <code className="rounded bg-gray-100 px-1">{mode}</code>
            </div>
            <div>Messages: {messages.length}</div>
          </div>
        </Section>
      </div>
    </div>
  );
}
