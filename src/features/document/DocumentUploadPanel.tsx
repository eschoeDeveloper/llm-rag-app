import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from '../../shared/ui/Button.tsx';
import { Input } from '../../shared/ui/Input.tsx';
import { documentUploadService, DocumentUploadRequest, DocumentInfo } from '../../shared/services/DocumentUploadService.ts';

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
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [documents, setDocuments] = useState<DocumentInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // baseUrl 설정
  useEffect(() => {
    documentUploadService.setBaseUrl(baseUrl);
  }, [baseUrl]);

  const loadDocuments = useCallback(async () => {
    if (!sessionId) return;

    setLoading(true);
    try {
      const userDocuments = await documentUploadService.getUserDocuments(sessionId);
      setDocuments(userDocuments);
    } catch (error) {
      onError('문서 목록을 불러오는 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setLoading(false);
    }
  }, [sessionId, onError]);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 크기 체크 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        onError('파일 크기가 너무 큽니다. 최대 10MB까지 업로드 가능합니다.');
        return;
      }

      // 지원되는 파일 형식 체크
      const supportedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/msword',
        'text/plain',
        'text/markdown'
      ];

      if (!supportedTypes.includes(file.type)) {
        onError('지원되지 않는 파일 형식입니다. PDF, DOCX, TXT, MD 파일만 업로드 가능합니다.');
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
        loadDocuments();
      } else {
        onError('문서 업로드가 실패했습니다: ' + (response.errors?.join(', ') || '알 수 없는 오류'));
      }
    } catch (error) {
      onError('문서 업로드 중 오류가 발생했습니다: ' + (error as Error).message);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  }, [selectedFile, sessionId, title, description, category, onUploadComplete, onError, loadDocuments]);

  const deleteDocument = useCallback(async (documentId: string) => {
    if (!sessionId) return;

    try {
      await documentUploadService.deleteDocument(documentId, sessionId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (error) {
      onError('문서 삭제 중 오류가 발생했습니다: ' + (error as Error).message);
    }
  }, [sessionId, onError]);

  React.useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">문서 업로드</h3>
      
      {/* 파일 선택 */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">파일 선택</label>
        <div className="flex items-center space-x-2">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept=".pdf,.docx,.doc,.txt,.md"
            className="hidden"
          />
          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            disabled={uploading}
          >
            파일 선택
          </Button>
          {selectedFile && (
            <span className="text-sm text-gray-600">
              {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
            </span>
          )}
        </div>
      </div>

      {/* 업로드 정보 */}
      {selectedFile && (
        <div className="space-y-3 p-4 bg-gray-50 rounded-lg">
          <Input
            value={title}
            onChange={setTitle}
            placeholder="문서 제목"
            className="w-full"
          />
          <Input
            value={description}
            onChange={setDescription}
            placeholder="문서 설명 (선택사항)"
            className="w-full"
          />
          <Input
            value={category}
            onChange={setCategory}
            placeholder="카테고리 (선택사항)"
            className="w-full"
          />
          
          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>업로드 중...</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          
          <Button
            onClick={handleUpload}
            disabled={uploading || !title.trim()}
            className="w-full"
          >
            {uploading ? '업로드 중...' : '업로드'}
          </Button>
        </div>
      )}

      {/* 문서 목록 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-gray-800">내 문서</h4>
          <Button onClick={loadDocuments} size="sm" variant="outline" disabled={loading}>
            {loading ? '로딩 중...' : '새로고침'}
          </Button>
        </div>
        
        {documents.length === 0 ? (
          <div className="text-center py-4 text-gray-500">업로드된 문서가 없습니다.</div>
        ) : (
          <div className="space-y-2">
            {documents.map((doc) => (
              <div key={doc.id} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium text-gray-800">{doc.title}</h5>
                    {doc.description && (
                      <p className="text-sm text-gray-600 mt-1">{doc.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                      <span>청크: {doc.totalChunks}개</span>
                      <span>업로드: {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                      {doc.category && <span>카테고리: {doc.category}</span>}
                    </div>
                  </div>
                  <Button
                    onClick={() => deleteDocument(doc.id)}
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                  >
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
