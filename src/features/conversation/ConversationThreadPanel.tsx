import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { conversationThreadService, ConversationThread, CreateThreadRequest } from '../../shared/services/ConversationThreadService.ts';

interface ConversationThreadPanelProps {
  sessionId: string | null;
  onThreadSelect: (thread: ConversationThread) => void;
  onError: (error: string) => void;
  refreshKey?: number; // 새로고침을 위한 key prop
}

export const ConversationThreadPanel: React.FC<ConversationThreadPanelProps> = ({
  sessionId,
  onThreadSelect,
  onError,
  refreshKey,
}) => {
  const [threads, setThreads] = useState<ConversationThread[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newThreadTitle, setNewThreadTitle] = useState('');

  // baseUrl 설정
  useEffect(() => {
    conversationThreadService.setBaseUrl('/api');
  }, []);
  const [newThreadDescription, setNewThreadDescription] = useState('');

  const loadThreads = useCallback(async () => {
    if (!sessionId) {
      console.log('No sessionId, skipping thread load');
      return;
    }

    console.log('Loading threads for sessionId:', sessionId);
    setLoading(true);
    try {
      const userThreads = await conversationThreadService.getUserThreads(sessionId);
      console.log('Loaded threads:', userThreads);
      console.log('Thread count:', userThreads.length);
      userThreads.forEach(thread => {
        console.log(`Thread ${thread.id}: ${thread.messages ? thread.messages.length : 'null'} messages`);
      });
      setThreads(userThreads);
    } catch (error) {
      console.error('Error loading threads:', error);
      onError('스레드 목록을 불러오는 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onError]);

  const createThread = useCallback(async () => {
    if (!sessionId || !newThreadTitle.trim()) {
      console.log('Cannot create thread: sessionId or title missing');
      return;
    }

    console.log('Creating thread with title:', newThreadTitle.trim());
    console.log('Using sessionId for thread creation:', sessionId);
    try {
      const request: CreateThreadRequest = {
        title: newThreadTitle.trim(),
        description: newThreadDescription.trim() || undefined,
      };

      const newThread = await conversationThreadService.createThread(request, sessionId);
      console.log('Thread created successfully:', newThread);
      
      // 로컬 상태 업데이트
      setThreads(prev => {
        const updated = [newThread, ...prev];
        console.log('Updated threads list:', updated);
        return updated;
      });
      
      // 백엔드에서 최신 데이터 다시 로드
      console.log('Reloading threads from backend...');
      console.log('Using sessionId for thread loading:', sessionId);
      const latestThreads = await conversationThreadService.getUserThreads(sessionId);
      console.log('Latest threads from backend:', latestThreads);
      setThreads(latestThreads);
      
      setNewThreadTitle('');
      setNewThreadDescription('');
      setShowCreateForm(false);
    } catch (error) {
      console.error('Error creating thread:', error);
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

  // refreshKey가 변경될 때 스레드 목록 새로고침 (메시지 개수 업데이트를 위해)
  useEffect(() => {
    if (refreshKey !== undefined) {
      console.log('Refresh key changed, reloading threads:', refreshKey);
      loadThreads();
    }
  }, [refreshKey, loadThreads]);

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
            onChange={setNewThreadTitle}
            placeholder="스레드 제목"
            className="w-full"
          />
          <Input
            value={newThreadDescription}
            onChange={setNewThreadDescription}
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
          threads.map((thread, index) => (
            <div
              key={thread.id || `thread-${index}`}
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
                    <span>메시지: {thread.messages ? thread.messages.filter(msg => msg.role === 'USER').length : 0}개</span>
                    <span>생성: {thread.createdAt ? new Date(thread.createdAt).toLocaleDateString() : '알 수 없음'}</span>
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
                      onClick={() => archiveThread(thread.id)}
                      size="sm"
                      variant="outline"
                      className="text-yellow-600 hover:text-yellow-700"
                    >
                      보관
                    </Button>
                  )}
                  <Button
                    onClick={() => deleteThread(thread.id)}
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
