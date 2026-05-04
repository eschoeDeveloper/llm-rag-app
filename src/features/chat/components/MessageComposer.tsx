import React from "react";
import { Textarea } from "../../../shared/ui/Textarea.tsx";
import { Button } from "../../../shared/ui/Button.tsx";

type Props = {
  input: string;
  onInputChange: (v: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onCancel: () => void;
  loading: boolean;
  mode: "ask" | "chat";
  error: string | null;
  onClearError: () => void;
};

export function MessageComposer({
  input,
  onInputChange,
  onSubmit,
  onCancel,
  loading,
  mode,
  error,
  onClearError,
}: Props) {
  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e as unknown as React.FormEvent);
    }
  }

  return (
    <div className="bg-elevated border-t border-line-subtle p-4">
      {error && (
        <div className="mb-3 px-3 py-2 bg-soft-sand border border-line rounded-md">
          <div className="flex items-center text-sm text-ink">
            <span>{error}</span>
            <button onClick={onClearError} className="ml-auto text-ink-tertiary hover:text-ink">
              ✕
            </button>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} className="flex space-x-3">
        <div className="flex-1">
          <Textarea
            value={input}
            onChange={onInputChange}
            onKeyDown={handleKeyDown}
            placeholder={mode === "ask" ? "질문을 입력하세요" : "컨텍스트 기반 대화를 시작하세요"}
            rows={3}
            disabled={loading}
          />
        </div>
        <div className="flex flex-col space-y-2">
          <Button type="submit" variant="primary" disabled={loading || !input.trim()}>
            {loading ? "전송 중…" : "전송"}
          </Button>
          {loading && (
            <Button type="button" onClick={onCancel} variant="outline" size="sm">
              취소
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}
