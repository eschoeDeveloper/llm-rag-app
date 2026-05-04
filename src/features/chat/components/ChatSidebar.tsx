import React from "react";
import { Button } from "../../../shared/ui/Button.tsx";
import { AdvancedSearchPanel } from "../../search/AdvancedSearchPanel.tsx";
import { ConversationThreadPanel } from "../../conversation/ConversationThreadPanel.tsx";
import { DocumentUploadPanel } from "../../document/DocumentUploadPanel.tsx";
import { ChatSettings } from "./ChatSettings.tsx";
import { ModeValue } from "../types.ts";

export type SidebarTab = "chat" | "search" | "threads" | "documents";

type Props = {
  activeTab: SidebarTab;
  onTabChange: (t: SidebarTab) => void;

  // chat tab
  mode: ModeValue;
  onModeChange: (m: ModeValue) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  config: { topK: number; threshold: number };
  onConfigChange: (patch: Partial<{ topK: number; threshold: number }>) => void;
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
  templates: Array<{ id: string; name: string }>;
  customPrompt: string;
  onCustomPromptChange: (v: string) => void;
  sessionId: string | null;
  onLoadHistory: () => void;
  onClearMessages: () => void;

  // shared
  base: string;
  onError: (msg: string) => void;

  // search
  onSearchResults: (results: any[]) => void;

  // threads
  onThreadSelect: (thread: any) => void;
  threadsRefreshKey: number;
  onRefreshThreads: () => void;

  // documents
  onDocumentUpload: (doc: any) => void;
};

type TabDef = { id: SidebarTab; label: string; icon: React.ReactNode };

// Lucide-style 아이콘 inline SVG (외부 deps 없음, 16x16 stroke=1.75)
const Icon = {
  chat: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  search: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>
    </svg>
  ),
  threads: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M3 6h18M3 12h18M3 18h12"/>
    </svg>
  ),
  documents: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>
    </svg>
  ),
};

const TABS: TabDef[] = [
  { id: "chat", label: "채팅", icon: Icon.chat },
  { id: "search", label: "검색", icon: Icon.search },
  { id: "threads", label: "스레드", icon: Icon.threads },
  { id: "documents", label: "문서", icon: Icon.documents },
];

export function ChatSidebar(props: Props) {
  const { activeTab, onTabChange, base, onError, sessionId, mode } = props;

  return (
    <div className="w-80 bg-elevated border-r border-line-subtle flex flex-col">
      {/* 헤더 — 타이틀 + 상태 칩 */}
      <div className="px-4 pt-4 pb-3 border-b border-line-subtle space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-matcha shrink-0" />
          <h2 className="text-sm font-semibold text-ink">RAG 어시스턴트</h2>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <StatusChip
            label={mode === "ask" ? "Ask" : "Chat"}
            tone={mode === "chat" ? "accent" : "neutral"}
          />
          <StatusChip
            label={sessionId ? `세션 ${sessionId.substring(0, 8)}…` : "세션 없음"}
            tone="muted"
          />
        </div>
      </div>

      {/* 탭 네비게이션 — 아이콘 + 라벨, active 강조 */}
      <div className="border-b border-line-subtle">
        <div className="flex">
          {TABS.map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onTabChange(t.id)}
                className={`flex-1 flex flex-col items-center justify-center gap-1 px-2 py-2.5 text-[11px] font-medium transition-all
                  ${isActive
                    ? "bg-matcha-soft text-matcha-hover border-b-2 border-matcha"
                    : "text-ink-tertiary border-b-2 border-transparent hover:text-ink hover:bg-muted"}`}
                aria-current={isActive ? "page" : undefined}
              >
                <span className={isActive ? "text-matcha" : ""}>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 탭 콘텐츠 */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === "chat" && (
          <ChatSettings
            mode={props.mode}
            onModeChange={props.onModeChange}
            showAdvanced={props.showAdvanced}
            onToggleAdvanced={props.onToggleAdvanced}
            config={props.config}
            onConfigChange={props.onConfigChange}
            selectedTemplate={props.selectedTemplate}
            onTemplateChange={props.onTemplateChange}
            templates={props.templates}
            customPrompt={props.customPrompt}
            onCustomPromptChange={props.onCustomPromptChange}
            sessionId={sessionId}
            onLoadHistory={props.onLoadHistory}
            onClearMessages={props.onClearMessages}
          />
        )}

        {activeTab === "search" && (
          <AdvancedSearchPanel
            sessionId={sessionId}
            baseUrl={base}
            onSearchResults={props.onSearchResults}
            onError={onError}
          />
        )}

        {activeTab === "threads" && (
          <div className="space-y-3">
            <ConversationThreadPanel
              sessionId={sessionId}
              onThreadSelect={props.onThreadSelect}
              onError={onError}
              refreshKey={props.threadsRefreshKey}
              baseUrl={base}
            />
            <Button onClick={props.onRefreshThreads} variant="outline" size="sm" className="w-full">
              스레드 목록 새로고침
            </Button>
          </div>
        )}

        {activeTab === "documents" && (
          <DocumentUploadPanel
            sessionId={sessionId}
            onUploadComplete={props.onDocumentUpload}
            onError={onError}
            baseUrl={base}
          />
        )}
      </div>
    </div>
  );
}

function StatusChip({ label, tone }: { label: string; tone: "accent" | "neutral" | "muted" }) {
  const cls = {
    accent: "bg-matcha text-ink-on-accent",
    neutral: "bg-matcha-soft text-matcha-hover",
    muted: "bg-muted text-ink-secondary border border-line-subtle",
  }[tone];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded ${cls}`}>
      {label}
    </span>
  );
}
