import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { documentUploadService, DocumentUploadRequest, DocumentInfo } from '../../shared/services/DocumentUploadService.ts';
import { VisionUsageCard } from './VisionUsageCard.tsx';

const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface DocumentUploadPanelProps {
  sessionId: string | null;
  onUploadComplete: (document: DocumentInfo) => void;
  onError: (error: string) => void;
  baseUrl?: string;
}

export const DocumentUploadPanel: React.FC<DocumentUploadPanelProps> = ({
  sessionId,
  onUploadComplete,
  onError,
  baseUrl = '/api',
}) => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [warnings, setWarnings] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // baseUrl 설정
  useEffect(() => {
    documentUploadService.setBaseUrl(baseUrl);
  }, [baseUrl]);

  /**
   * 문서 목록 — React Query 로 캐싱 + sessionId 변경 시 자동 refetch.
   * 업로드/삭제 후 invalidateQueries 로 갱신.
   */
  const documentsQuery = useQuery<DocumentInfo[]>({
    queryKey: ["documents", sessionId],
    queryFn: () => documentUploadService.getUserDocuments(sessionId!),
    enabled: !!sessionId,
  });

  const documents = documentsQuery.data ?? [];
  const loading = documentsQuery.isLoading;

  // 업로드/삭제 후 호출해 refetch 트리거
  const refreshDocuments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ["documents", sessionId] });
  }, [queryClient, sessionId]);

  // 에러 처리는 effect 로 한 번만
  useEffect(() => {
    if (documentsQuery.error) {
      onError('문서 목록을 불러오는 중 오류가 발생했습니다: ' + (documentsQuery.error as Error).message);
    }
  }, [documentsQuery.error, onError]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크
      if (file.size > MAX_FILE_SIZE_BYTES) {
        onError(`파일 크기가 너무 큽니다. 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다.`);
        return;
      }

      // 지원되는 파일 형식 체크
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',           // docx
        'application/msword',                                                                // doc
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',         // pptx
        'application/vnd.ms-powerpoint',                                                     // ppt
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',                 // xlsx
        'application/vnd.ms-excel',                                                          // xls
        'text/plain',
        'text/markdown',
        'text/html',
      ];

      if (!supportedTypes.includes(file.type)) {
        onError('지원되지 않는 파일 형식입니다. PDF, DOCX, PPTX, XLSX, TXT, MD, HTML 파일만 업로드 가능합니다.');
        return;
      }

      setSelectedFile(file);
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, '')); // 확장자 제거
      }
    }
  }, [title, onError]);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || !sessionId || !title.trim()) return;

    setUploading(true);
    setProgress(0);

    try {
      const request: DocumentUploadRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        category: category.trim() || undefined,
        sessionId,
      };

      const response = await documentUploadService.uploadDocument(
        selectedFile,
        request,
        sessionId,
        (progressValue) => setProgress(progressValue)
      );

      if (response.status === 'COMPLETED') {
        // 백엔드 경고 노출 (image-only PDF OCR fallback 등)
        setWarnings(response.warnings ?? []);

        onUploadComplete({
          id: response.documentId,
          title: response.title,
          description: description,
          category: category,
          totalChunks: response.totalChunks,
          uploadedAt: response.uploadedAt,
        });

        // 폼 초기화
        setSelectedFile(null);
        setTitle('');
        setDescription('');
        setCategory('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }

        // 문서 목록 새로고침
        refreshDocuments();
      } else {
        setWarnings([]);
        onError('문서 업로드가 실패했습니다: ' + (response.errors?.join(', ') || '알 수 없는 오류'));
      }
    } catch (error) {
      onError('문서 업로드 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [selectedFile, sessionId, title, description, category, onUploadComplete, onError, refreshDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!sessionId) return;
    try {
      await documentUploadService.deleteDocument(documentId, sessionId);
      // 낙관 업데이트: 즉시 캐시에서 제거 후 백그라운드로 refetch
      queryClient.setQueryData<DocumentInfo[]>(["documents", sessionId], prev =>
        (prev ?? []).filter(d => d.id !== documentId));
      refreshDocuments();
    } catch (error) {
      onError('문서 삭제 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError, queryClient, refreshDocuments]);

  // useQuery 가 sessionId 변경 시 자동 fetch — 별도 effect 불필요

  return (
    <div className="space-y-5">
      <VisionUsageCard baseUrl={baseUrl} sessionId={sessionId} />

      {warnings.length > 0 && (
        <div className="rounded-md border border-line bg-soft-sand p-3 space-y-1">
          <div className="flex items-start justify-between gap-2">
            <div className="text-xs font-semibold text-ink">⚠ 업로드 경고</div>
            <button
              onClick={() => setWarnings([])}
              className="text-ink-tertiary hover:text-ink text-xs"
              aria-label="경고 닫기"
            >
              ✕
            </button>
          </div>
          {warnings.map((w, i) => (
            <p key={i} className="text-[11px] text-ink-secondary leading-relaxed">{w}</p>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <h3 className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">문서 업로드</h3>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept=".pdf,.docx,.doc,.pptx,.ppt,.xlsx,.xls,.txt,.md,.html"
          className="hidden"
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          variant="outline"
          size="sm"
          disabled={uploading}
          className="w-full"
        >
          {selectedFile ? '다른 파일 선택' : '파일 선택'}
        </Button>
        {selectedFile && (
          <p className="text-[11px] text-ink-secondary truncate" title={selectedFile.name}>
            {selectedFile.name} · {(selectedFile.size / 1024 / 1024).toFixed(2)}MB
          </p>
        )}

        {selectedFile && (
          <div className="space-y-2 p-3 bg-canvas border border-line-subtle rounded-md">
            <Input value={title} onChange={setTitle} placeholder="문서 제목" />
            <Input value={description} onChange={setDescription} placeholder="설명 (선택)" />
            <Input value={category} onChange={setCategory} placeholder="카테고리 (선택)" />

            {uploading && (
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] text-ink-secondary">
                  <span>업로드 중…</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-matcha h-full rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            )}

            <Button
              onClick={handleUpload}
              disabled={uploading || !title.trim()}
              variant="primary"
              size="sm"
              className="w-full"
            >
              {uploading ? '업로드 중…' : '업로드'}
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-ink-tertiary uppercase tracking-wide">내 문서</h3>
          <Button onClick={refreshDocuments} size="sm" variant="ghost" disabled={loading} className="text-xs">
            {loading ? '…' : '↻'}
          </Button>
        </div>

        {documents.length === 0 ? (
          <p className="text-xs text-ink-tertiary text-center py-4">업로드된 문서가 없습니다.</p>
        ) : (
          <div className="space-y-1.5">
            {documents.map((doc) => (
              <div key={doc.id} className="p-2.5 border border-line-subtle rounded-md hover:bg-muted transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 space-y-1">
                    <h5 className="text-sm font-medium text-ink truncate" title={doc.title}>{doc.title}</h5>
                    {doc.description && (
                      <p className="text-[11px] text-ink-secondary line-clamp-2">{doc.description}</p>
                    )}
                    <div className="flex items-center gap-1.5 flex-wrap text-[10px] text-ink-tertiary">
                      <span>{doc.totalChunks}개 청크</span>
                      <span>·</span>
                      <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      {doc.category && (<><span>·</span><span>{doc.category}</span></>)}
                    </div>
                  </div>
                  <Button onClick={() => deleteDocument(doc.id)} size="sm" variant="ghost" className="text-[10px] px-1.5 shrink-0">
                    삭제
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
