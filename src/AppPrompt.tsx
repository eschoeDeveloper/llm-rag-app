import React from "react";

import { EnhancedChatPanel } from "./features/chat/EnhancedChatPanel.tsx";
import { VectorPanel } from "./features/vector/VectorPanel.tsx";
import { Input } from "./shared/ui/Input.tsx";
import { Button } from "./shared/ui/Button.tsx";
import { useLocalStorage } from "./shared/hooks/useLocalStorage.ts";

const DEFAULT_BASE = (import.meta as any).env?.VITE_API_BASE ?? "/api";

type Tab = "chat" | "vector";

export default function AppPrompt() {
  const [base, setBase] = useLocalStorage("apiBase", DEFAULT_BASE);
  const [tab, setTab] = React.useState<Tab>("chat");

  return (
    <div className="min-h-screen bg-canvas text-ink">
      <header className="border-b border-line-subtle bg-elevated">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-matcha" />
            <span className="font-semibold">LLM RAG</span>
          </div>
          <nav className="flex items-center gap-1">
            <TabButton active={tab === "chat"} onClick={() => setTab("chat")}>Chat</TabButton>
            <TabButton active={tab === "vector"} onClick={() => setTab("vector")}>Vector</TabButton>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <section className="mb-6 rounded-lg border border-line-subtle bg-elevated p-4">
          <div className="flex items-center gap-3">
            <label className="text-xs font-medium text-ink-secondary whitespace-nowrap">API base</label>
            <Input
              value={base}
              onChange={setBase}
              placeholder="/api 또는 https://..."
            />
          </div>
        </section>

        <section className="rounded-lg border border-line-subtle bg-elevated overflow-hidden">
          {tab === "chat" ? <EnhancedChatPanel base={base} /> : <VectorPanel base={base} />}
        </section>
      </main>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 h-8 text-sm rounded transition-colors ${
        active
          ? "bg-matcha-soft text-matcha-hover font-medium"
          : "text-ink-secondary hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
