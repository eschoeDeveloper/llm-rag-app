import React from "react";

import { ChatPanel } from "./features/chat/ChatPanel.tsx";
import { VectorPanel } from "./features/vector/VectorPanel.tsx";
import { Section } from "./shared/ui/Section.tsx";
import { Input } from "./shared/ui/Input.tsx";
import { Button } from "./shared/ui/Button.tsx";
import { Chip } from "./shared/ui/Chip.tsx";
import { useLocalStorage } from "./shared/hooks/useLocalStorage.ts";

const DEFAULT_BASE = process.env.REACT_APP_API_BASE || "https://llm-rag-api-a8768292f672.herokuapp.com/api";
type Tab = "chat" | "vector";

export default function AppPrompt() {
  const [base, setBase] = useLocalStorage("apiBase", DEFAULT_BASE);
  const [tab, setTab] = React.useState("chat" as Tab);

  return (
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <div className="mx-auto max-w-5xl px-5 py-8">
          <header className="mb-6">
            <h1 className="text-2xl font-bold">LLM RAG Playground</h1>
            <p className="text-sm text-gray-600">Spring WebFlux + PostgreSQL/pgvector LLM + RAG Test</p>
          </header>

          <Section title="API Endpoint" right={<Chip>e.g. ${base}</Chip>}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
              <div className="md:col-span-3">
                <Input value={base} onChange={setBase} placeholder="API Base URL" disabled={base !== undefined ? true : false}/>
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