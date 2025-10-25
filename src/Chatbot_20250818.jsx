import React, { useMemo, useState, useEffect, useRef } from "react";

/**
 * LLM RAG Playground (single-file React)
 * - Test your Spring WebFlux API (ask/chat/vector-search)
 * - Works with endpoints like:
 *   - POST /api/embeddings/search { embedding: number[], query?: string, topK?: number }
 *   - POST /api/ask            { query: string }
 *   - POST /api/chat           { query: string }
 *
 * Tailwind-friendly markup. No external UI libs required.
 */

function Textarea({ value, onChange, placeholder, rows = 6 }) {
  return (
    <textarea
      className="w-full rounded-xl border p-3 outline-none shadow-sm focus:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
}

function Input({ value, onChange, placeholder, type = "text" }) {
  return (
    <input
      className="w-full rounded-xl border p-3 outline-none shadow-sm focus:ring-2"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      type={type}
    />
  );
}

function Button({ children, onClick, disabled }) {
  return (
    <button
      className="rounded-xl px-4 py-2 shadow-sm border bg-white hover:bg-gray-50 disabled:opacity-60"
      onClick={onClick}
      disabled={disabled}
      type="button"
    >
      {children}
    </button>
  );
}

function Chip({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs bg-white">
      {children}
    </span>
  );
}

function Section({ title, children, right }) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{title}</h2>
        {right}
      </div>
      {children}
    </div>
  );
}

const DEFAULT_BASE = "http://localhost:8080/api";

export default function Chatbot() {
  const [base, setBase] = useState(DEFAULT_BASE);
  const [tab, setTab] = useState("chat"); // chat | vector

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="mx-auto max-w-5xl px-5 py-8">
        <header className="mb-6">
          <h1 className="text-2xl font-bold">LLM RAG Playground</h1>
          <p className="text-sm text-gray-600">Test your Spring WebFlux + PostgreSQL/pgvector backend</p>
        </header>

        <Section
          title="API Endpoint"
          right={<Chip>e.g. http://localhost:8080/api</Chip>}
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="md:col-span-3">
              <Input value={base} onChange={setBase} />
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={() => setTab("chat")} disabled={tab === "chat"}>Chat</Button>
              <Button onClick={() => setTab("vector")} disabled={tab === "vector"}>Vector Search</Button>
            </div>
          </div>
        </Section>

        <div className="mt-6" />
        {tab === "chat" ? <ChatPanel base={base} /> : <VectorPanel base={base} />}

        <footer className="mt-10 text-xs text-gray-500">
          Tips: ensure CORS allows your dev origin; configure in Spring as needed.
        </footer>
      </div>
    </div>
  );
}

function useScrollToBottom(deps) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, deps);
  return ref;
}

function ChatPanel({ base }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("ask"); // ask | chat
  const boxRef = useScrollToBottom([messages]);

  async function send() {
    if (!input.trim()) return;
    const me = { role: "user", content: input, ts: Date.now() };
    setMessages((m) => [...m, me]);
    setInput("");
    setLoading(true);
    try {
      const url = `${base}/${mode}`; // /ask or /chat
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ query: me.content })
      });
      const text = await res.text();
      const reply = { role: "assistant", content: text, ts: Date.now() };
      setMessages((m) => [...m, reply]);
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: String(e), ts: Date.now(), error: true }]);
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
                  <div className={`inline-block max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${m.role === "user" ? "bg-blue-50" : m.error ? "bg-red-50" : "bg-gray-100"}`}>
                    <div className="mb-1 text-[11px] uppercase tracking-wide opacity-60">{m.role}</div>
                    {m.content}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-6">
            <div className="md:col-span-5">
              <Textarea value={input} onChange={setInput} placeholder="Ask something…" rows={3} />
            </div>
            <div className="flex flex-col gap-2">
              <select
                className="rounded-xl border p-2 text-sm"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
              >
                <option value="ask">/ask (no RAG)</option>
                <option value="chat">/chat (RAG)</option>
              </select>
              <Button onClick={send} disabled={loading}>{loading ? "Sending…" : "Send"}</Button>
            </div>
          </div>
        </Section>
      </div>

      <div>
        <Section title="Debug">
          <div className="text-xs text-gray-600 space-y-2">
            <div>Base: <code className="rounded bg-gray-100 px-1">{base}</code></div>
            <div>Mode: <code className="rounded bg-gray-100 px-1">{mode}</code></div>
            <div>Messages: {messages.length}</div>
          </div>
        </Section>
      </div>
    </div>
  );
}

function VectorPanel({ base }) {
  const [rawEmbedding, setRawEmbedding] = useState("");
  const [topK, setTopK] = useState("10");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function parseEmbedding(text) {
    // accepts: "0.1, 0.2, -0.3" or "[0.1,0.2]" or "(0.1,0.2)"
    const cleaned = text.trim().replace(/^\[|^\(|\]$|\)$/g, "");
    if (!cleaned) return [];
    return cleaned.split(/[,\s]+/).map((x) => parseFloat(x)).filter((x) => !Number.isNaN(x));
  }

  async function runSearch() {
    setError("");
    const arr = parseEmbedding(rawEmbedding);
    if (!arr.length) {
      setError("Enter at least one float value for the embedding.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${base}/embeddings/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        body: JSON.stringify({ embedding: arr, topK: Number(topK) || 10 })
      });
      const data = await res.json();
      setResults(Array.isArray(data) ? data : [data]);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      <div className="md:col-span-2">
        <Section title="Vector Search">
          <div className="mb-3 text-sm text-gray-600">
            Paste a vector to test cosine search (dimension must match your DB column).
          </div>
          <Textarea
            value={rawEmbedding}
            onChange={setRawEmbedding}
            placeholder="e.g. 0.12, -0.03, 0.88, ... (1536 dims for text-embedding-3-small)"
            rows={6}
          />
          <div className="mt-3 flex items-center gap-2">
            <Input value={topK} onChange={setTopK} placeholder="Top K" />
            <Button onClick={runSearch} disabled={loading}>{loading ? "Searching…" : "Search"}</Button>
          </div>
          {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        </Section>
      </div>

      <div>
        <Section title="Results">
          <div className="space-y-3">
            {results.length === 0 && (
              <div className="text-sm text-gray-500">No results.</div>
            )}
            {results.map((r, i) => (
              <div key={i} className="rounded-xl border p-3">
                <div className="text-sm font-medium">#{r.id} {r.title || "(no title)"}</div>
                <div className="text-xs text-gray-600 line-clamp-3">{r.content}</div>
                <div className="mt-1 text-[11px] text-gray-500">created_at: {r.created_at}</div>
              </div>
            ))}
          </div>
        </Section>
      </div>
    </div>
  );
}
