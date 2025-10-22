import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { conversationThreadService, ConversationThread, CreateThreadRequest } from '../../shared/services/ConversationThreadService.ts';

interface ConversationThreadPanelProps {
  sessionId: string | null;
  onThreadSelect: (thread: ConversationThread) => void;
  onError: (error: string) => void;
}

export const ConversationThreadPanel: React.FC<ConversationThreadPanelProps> = ({
  sessionId,
  onThreadSelect,
  onError,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');
  const [newThreadDescription, setNewThreadDescription] = useState('');

  const loadThreads = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const userThreads = await conversationThreadService.getUserThreads(sessionId);
      setThreads(userThreads);
    } catch (error) {
      onError('스레드 목록을 불러오는 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onError]);

  const createThread = useCallback(async () => {
    if (!sessionId || !newThreadTitle.trim()) return;

    try {
      const request: CreateThreadRequest = {
        title: newThreadTitle.trim(),
        description: newThreadDescription.trim() || undefined,
      };

      const newThread = await conversationThreadService.createThread(request, sessionId);
      setThreads(prev => [newThread, ...prev]);
      setNewThreadTitle('');
      setNewThreadDescription('');
      setShowCreateForm(false);
    } catch (error) {
      onError('스레드 생성 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, newThreadTitle, newThreadDescription, onError]);

  const archiveThread = useCallback(async (threadId: string) => {
    if (!sessionId) return;

    try {
      await conversationThreadService.archiveThread(threadId, sessionId);
      setThreads(prev => prev.filter(thread => thread.id !== threadId));
    } catch (error) {
      onError('스레드 보관 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError]);

  const deleteThread = useCallback(async (threadId: string) => {
    if (!sessionId) return;

    try {
      await conversationThreadService.deleteThread(threadId, sessionId);
      setThreads(prev => prev.filter(thread => thread.id !== threadId));
    } catch (error) {
      onError('스레드 삭제 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError]);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">대화 스레드</h3>
        <Button
          onClick={() => setShowCreateForm(!showCreateForm)}
          size="sm"
          variant="outline"
        >
          + 새 스레드
        </Button>
      </div>

      {/* 새 스레드 생성 폼 */}
      {showCreateForm && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Input
            value={newThreadTitle}
            onChange={(e) => setNewThreadTitle(e.target.value)}
            placeholder="스레드 제목"
            className="w-full"
          />
          <Input
            value={newThreadDescription}
            onChange={(e) => setNewThreadDescription(e.target.value)}
            placeholder="스레드 설명 (선택사항)"
            className="w-full"
          />
          <div className="flex space-x-2">
            <Button
              onClick={createThread}
              disabled={!newThreadTitle.trim()}
              size="sm"
            >
              생성
            </Button>
            <Button
              onClick={() => setShowCreateForm(false)}
              size="sm"
              variant="outline"
            >
              취소
            </Button>
          </div>
        </div>
      )}

      {/* 스레드 목록 */}
      <div className="space-y-2">
        {loading ? (
          <div className="text-center py-4 text-gray-500">로딩 중...</div>
        ) : threads.length === 0 ? (
          <div className="text-center py-4 text-gray-500">대화 스레드가 없습니다.</div>
        ) : (
          threads.map((thread) => (
            <div
              key={thread.id}
              className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
              onClick={() => onThreadSelect(thread)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-800">{thread.title}</h4>
                  {thread.description && (
                    <p className="text-sm text-gray-600 mt-1">{thread.description}</p>
                  )}
                  <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                    <span>메시지: {thread.messages.length}개</span>
                    <span>생성: {new Date(thread.createdAt).toLocaleDateString()}</span>
                    <span className={`px-2 py-1 rounded ${
                      thread.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                      thread.status === 'ARCHIVED' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {thread.status === 'ACTIVE' ? '활성' :
                       thread.status === 'ARCHIVED' ? '보관됨' : '삭제됨'}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-1">
                  {thread.status === 'ACTIVE' && (
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        archiveThread(thread.id);
                      }}
                      size="sm"
                      variant="outline"
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      보관
                    </Button>
                  )}
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteThread(thread.id);
                    }}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
                    삭제
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
