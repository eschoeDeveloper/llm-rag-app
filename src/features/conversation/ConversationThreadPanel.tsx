import React, { useState, useEffect, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { conversationThreadService, ConversationThread, CreateThreadRequest } from '../../shared/services/ConversationThreadService.ts';

interface ConversationThreadPanelProps {
  sessionId: string | null;
  onThreadSelect: (thread: ConversationThread) => void;
  onError: (error: string) => void;
  refreshKey?: number; // 새로고침을 위한 key prop
  baseUrl?: string; // API base URL
}

export const ConversationThreadPanel: React.FC<ConversationThreadPanelProps> = ({
  sessionId,
  onThreadSelect,
  onError,
  refreshKey,
  baseUrl = '/api',
}) => {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');
  // 제목 편집 — 한 번에 한 스레드만 편집 가능 (id 보유)
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  useEffect(() => {
    conversationThreadService.setBaseUrl(baseUrl);
  }, [baseUrl]);

  /**
   * 스레드 목록 — React Query 로 sessionId+refreshKey 변경 시 자동 refetch.
   * mutation (생성/보관) 후 invalidate 로 갱신.
   */
  const threadsQuery = useQuery<ConversationThread[]>({
    queryKey: ["threads", sessionId, refreshKey],
    queryFn: () => conversationThreadService.getUserThreads(sessionId!),
    enabled: !!sessionId,
  });

  const threads = threadsQuery.data ?? [];
  const loading = threadsQuery.isLoading;

  useEffect(() => {
    if (threadsQuery.error) {
      onError('스레드 목록을 불러오는 중 오류가 발생했습니다: ' + (threadsQuery.error as Error).message);
    }
  }, [threadsQuery.error, onError]);

  const refreshThreads = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["threads", sessionId] });
  }, [queryClient, sessionId]);

  const createThread = useCallback(async () => {
    if (!sessionId || !newThreadTitle.trim()) return;
    try {
      const request: CreateThreadRequest = {
        title: newThreadTitle.trim(),
        description: newThreadDescription.trim() || undefined,
      };
      await conversationThreadService.createThread(request, sessionId);
      refreshThreads();
      setNewThreadTitle('');
      setNewThreadDescription('');
      setShowCreateForm(false);
    } catch (error) {
      onError('스레드 생성 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, newThreadTitle, newThreadDescription, onError, refreshThreads]);

  const archiveThread = useCallback(async (threadId: string) => {
    if (!sessionId) return;
    try {
      await conversationThreadService.archiveThread(threadId, sessionId);
      // 낙관 업데이트: 즉시 캐시에서 제거 후 refetch
      queryClient.setQueryData<ConversationThread[]>(["threads", sessionId, refreshKey], prev =>
        (prev ?? []).filter(t => t.id !== threadId));
      refreshThreads();
    } catch (error) {
      onError('스레드 보관 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError, queryClient, refreshKey, refreshThreads]);

  const startEdit = useCallback((thread: ConversationThread) => {
    setEditingId(thread.id);
    setEditingTitle(thread.title);
  }, []);

  const cancelEdit = useCallback(() => {
    setEditingId(null);
    setEditingTitle('');
  }, []);

  const saveTitle = useCallback(async (threadId: string) => {
    if (!sessionId || !editingTitle.trim()) {
      cancelEdit();
      return;
    }
    const newTitle = editingTitle.trim();
    try {
      // 낙관 업데이트 — 즉시 UI 반영
      queryClient.setQueryData<ConversationThread[]>(["threads", sessionId, refreshKey], prev =>
        (prev ?? []).map(t => t.id === threadId ? { ...t, title: newTitle } : t));
      setEditingId(null);
      setEditingTitle('');
      await conversationThreadService.updateThreadTitle(threadId, { title: newTitle }, sessionId);
      refreshThreads();
    } catch (error) {
      onError('제목 변경 중 오류가 발생했습니다: ' + (error as Error).message);
      refreshThreads(); // 실패 시 서버 상태로 복원
    }
  }, [sessionId, editingTitle, queryClient, refreshKey, refreshThreads, onError, cancelEdit]);

  const deleteThread = useCallback(async (threadId: string) => {
    if (!sessionId) return;
    try {
      await conversationThreadService.deleteThread(threadId, sessionId);
      queryClient.setQueryData<ConversationThread[]>(["threads", sessionId, refreshKey], prev =>
        (prev ?? []).filter(t => t.id !== threadId));
      refreshThreads();
    } catch (error) {
      onError('스레드 삭제 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError, queryClient, refreshKey, refreshThreads]);

  // refreshKey 변경은 useQuery 의 queryKey 에 포함되어 자동 refetch — 별도 effect 불필요

  const statusLabel = (s: ConversationThread['status']) =>
    s === 'ACTIVE' ? '활성' : s === 'ARCHIVED' ? '보관됨' : '삭제됨';
  const statusClass = (s: ConversationThread['status']) =>
    s === 'ACTIVE' ? 'bg-matcha-soft text-matcha-hover'
    : s === 'ARCHIVED' ? 'bg-soft-sand text-ink-secondary'
    : 'bg-muted text-ink-tertiary';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">스레드</h3>
        <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm" variant="ghost" className="text-xs">
          + 새 스레드
        </Button>
      </div>

      {showCreateForm && (
        <div className="space-y-2 p-3 bg-canvas border border-line-subtle rounded-md">
          <Input value={newThreadTitle} onChange={setNewThreadTitle} placeholder="스레드 제목" />
          <Input value={newThreadDescription} onChange={setNewThreadDescription} placeholder="설명 (선택)" />
          <div className="flex gap-2">
            <Button onClick={createThread} disabled={!newThreadTitle.trim()} size="sm" variant="primary" className="flex-1">
              생성
            </Button>
            <Button onClick={() => setShowCreateForm(false)} size="sm" variant="outline" className="flex-1">
              취소
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        {loading ? (
          <p className="text-xs text-ink-tertiary text-center py-4">로딩 중…</p>
        ) : threads.length === 0 ? (
          <p className="text-xs text-ink-tertiary text-center py-4">대화 스레드가 없습니다.</p>
        ) : (
          threads.map((thread, index) => {
            const turnCount = thread.messages
              ? thread.messages.filter(m => m.role === 'USER').length
              : 0;
            const created = thread.createdAt
              ? new Date(thread.createdAt).toLocaleDateString()
              : '—';
            return (
              <div
                key={thread.id || `thread-${index}`}
                onClick={() => editingId !== thread.id && onThreadSelect(thread)}
                className={`p-2.5 border border-line-subtle rounded-md transition-colors ${
                  editingId === thread.id
                    ? 'bg-canvas border-line cursor-default'
                    : 'hover:bg-muted hover:border-line cursor-pointer'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    {editingId === thread.id ? (
                      <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1.5">
                        <Input
                          value={editingTitle}
                          onChange={setEditingTitle}
                          placeholder="새 제목"
                          className="flex-1"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveTitle(thread.id);
                            else if (e.key === 'Escape') cancelEdit();
                          }}
                        />
                      </div>
                    ) : (
                      <h4
                        className="text-sm font-medium text-ink truncate hover:text-matcha-hover"
                        onDoubleClick={(e) => { e.stopPropagation(); startEdit(thread); }}
                        title="더블클릭으로 제목 수정"
                      >
                        {thread.title}
                      </h4>
                    )}
                    {thread.description && (
                      <p className="text-xs text-ink-secondary line-clamp-2">{thread.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-ink-tertiary">
                      <span className={`px-1.5 py-0.5 rounded ${statusClass(thread.status)}`}>
                        {statusLabel(thread.status)}
                      </span>
                      <span>{turnCount}턴</span>
                      <span>·</span>
                      <span>{created}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {editingId === thread.id ? (
                      <>
                        <Button onClick={() => saveTitle(thread.id)} size="sm" variant="primary" className="text-[10px] px-1.5">
                          저장
                        </Button>
                        <Button onClick={cancelEdit} size="sm" variant="ghost" className="text-[10px] px-1.5">
                          취소
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button onClick={() => startEdit(thread)} size="sm" variant="ghost" className="text-[10px] px-1.5">
                          편집
                        </Button>
                        {thread.status === 'ACTIVE' && (
                          <Button onClick={() => archiveThread(thread.id)} size="sm" variant="ghost" className="text-[10px] px-1.5">
                            보관
                          </Button>
                        )}
                        <Button onClick={() => deleteThread(thread.id)} size="sm" variant="ghost" className="text-[10px] px-1.5">
                          삭제
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
