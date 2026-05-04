import React from "react";
import { Button } from "../../../shared/ui/Button.tsx";
import { Textarea } from "../../../shared/ui/Textarea.tsx";
import { Modes, ModeValue } from "../types.ts";

type RagConfig = { topK: number; threshold: number };

type Props = {
  mode: ModeValue;
  onModeChange: (m: ModeValue) => void;
  showAdvanced: boolean;
  onToggleAdvanced: () => void;
  config: RagConfig;
  onConfigChange: (patch: Partial<RagConfig>) => void;
  selectedTemplate: string;
  onTemplateChange: (id: string) => void;
  templates: Array<{ id: string; name: string }>;
  customPrompt: string;
  onCustomPromptChange: (v: string) => void;
  sessionId: string | null;
  onLoadHistory: () => void;
  onClearMessages: () => void;
};

export function ChatSettings({
  mode,
  onModeChange,
  showAdvanced,
  onToggleAdvanced,
  config,
  onConfigChange,
  selectedTemplate,
  onTemplateChange,
  templates,
  customPrompt,
  onCustomPromptChange,
  sessionId,
  onLoadHistory,
  onClearMessages,
}: Props) {
  return (
    <div className="space-y-5">
      <Section title="모드">
        <div className="grid grid-cols-2 gap-2">
          {Modes.map((m) => (
            <Button
              key={m.value}
              onClick={() => onModeChange(m.value)}
              variant={mode === m.value ? "primary" : "outline"}
              size="sm"
            >
              {m.label}
            </Button>
          ))}
        </div>
        <p className="text-[11px] text-ink-tertiary leading-relaxed">
          {mode === "ask"
            ? "Ask: 컨텍스트 검색 없이 바로 LLM 호출"
            : "Chat: 업로드한 문서에서 검색 후 답변 + 인용"}
        </p>
      </Section>

      <Section title="고급 설정">
        <Button onClick={onToggleAdvanced} variant="outline" size="sm" className="w-full">
          {showAdvanced ? "접기" : "펼치기"}
        </Button>
        {showAdvanced && (
          <div className="space-y-3 p-3 bg-canvas border border-line-subtle rounded-md">
            <SubSection title="RAG 설정">
              <NumberRow
                label="Top K"
                value={config.topK}
                onChange={(v) => onConfigChange({ topK: v || 5 })}
                hint="검색 결과 개수"
              />
              <NumberRow
                label="Threshold"
                value={config.threshold}
                step={0.1}
                onChange={(v) => onConfigChange({ threshold: v || 0.1 })}
                hint="최소 유사도 (0~1)"
              />
            </SubSection>

            <SubSection title="프롬프트 템플릿">
              <select
                value={selectedTemplate}
                onChange={(e) => onTemplateChange(e.target.value)}
                className="w-full text-xs border border-line rounded px-2 py-1.5 bg-elevated text-ink"
              >
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            </SubSection>

            <SubSection title="커스텀 프롬프트">
              <Textarea
                value={customPrompt}
                onChange={onCustomPromptChange}
                placeholder="커스텀 프롬프트를 입력하세요"
                rows={3}
              />
            </SubSection>
          </div>
        )}
      </Section>

      <Section title="대화 관리">
        <div className="space-y-2">
          <Button onClick={onLoadHistory} variant="outline" size="sm" disabled={!sessionId} className="w-full">
            히스토리 불러오기
          </Button>
          <Button onClick={onClearMessages} variant="outline" size="sm" className="w-full">
            대화 비우기
          </Button>
        </div>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <h3 className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">{title}</h3>
      {children}
    </div>
  );
}

function SubSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-[11px] font-medium text-ink-secondary">{title}</label>
      {children}
    </div>
  );
}

function NumberRow({
  label,
  value,
  step,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  step?: number;
  onChange: (v: number) => void;
  hint?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <div className="flex flex-col">
        <label className="text-xs text-ink">{label}</label>
        {hint && <span className="text-[10px] text-ink-tertiary">{hint}</span>}
      </div>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(step ? parseFloat(e.target.value) : parseInt(e.target.value))}
        className="w-20 text-xs border border-line rounded px-2 py-1 bg-elevated text-ink"
      />
    </div>
  );
}
