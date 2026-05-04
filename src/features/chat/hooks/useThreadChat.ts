import React, { useState } from "react";
import { conversationThreadService } from "../../../shared/services/ConversationThreadService.ts";
import { ModeValue } from "../types.ts";

type Message = {
  role: string;
  content: string;
  timestamp: number;
  metadata?: Record<string, any>;
};

type Args = {
  base: string;
  activeThread: any;
  sessionId: string | null;
  mode: ModeValue;
  config: { topK: number; threshold: number };
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>;
  refreshThreads: () => void;
};

/**
 * 스레드 모드 메시지 송신.
 *
 * 백엔드 POST /api/threads/{id}/chat 한 번 호출로:
 *   - USER 메시지 추가
 *   - mode 에 따라 RAG (chat) 또는 LLM 단독 (ask) 호출
 *   - ASSISTANT 메시지 + citations 메타 저장
 *
 * UX 흐름:
 *   1. 입력 → optimistic USER 메시지 즉시 화면에 표시 (체감 반응성)
 *   2. sending=true 동안 입력창 비활성화 + typing indicator 노출
 *   3. 응답 도착 → 백엔드 권위 데이터로 messages 전체 교체 (timestamp/id 일치)
 */
export function useThreadChat({ base, activeThread, sessionId, mode, config, setMessages, refreshThreads }: Args) {
  // base 는 이미 "/api" 형태 (AppPrompt 의 DEFAULT_BASE = "/api") — 그대로 사용
  conversationThreadService.setBaseUrl(base);

  const [sending, setSending] = useState(false);

  async function send(message: string) {
    if (!activeThread || !sessionId) {
      throw new Error("Thread mode requires both an active thread and a session id");
    }

    const optimisticUser: Message = {
      role: "user",
      content: message,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, optimisticUser]);
    setSending(true);

    try {
      const updated = await conversationThreadService.threadChat(
        activeThread.id,
        {
          query: message,
          mode,
          config: { topK: config.topK, threshold: config.threshold },
        },
        sessionId,
      );

      if (updated && updated.messages) {
        const loaded: Message[] = updated.messages.map((msg: any) => ({
          role: msg.role.toLowerCase(),
          content: msg.content,
          timestamp: msg.timestamp ? new Date(msg.timestamp).getTime() : Date.now(),
          metadata: msg.metadata,
        }));
        setMessages(loaded);
      }

      refreshThreads();
    } finally {
      setSending(false);
    }
  }

  return { send, sending };
}
