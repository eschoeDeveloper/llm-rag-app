// Native fetch implementation - no http dependency
import { toAbsoluteUrl } from '../utils/urlUtils.ts';

export interface DocumentUploadRequest {
  title: string;
  description?: string;
  category?: string;
  metadata?: Record<string, any>;
  sessionId?: string;
}

export interface DocumentUploadResponse {
  documentId: string;
  title: string;
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  totalChunks: number;
  processedChunks: number;
  uploadedAt: string;
  errors?: string[];
  warnings?: string[];
  extractionMode?: string;
  metadata?: Record<string, any>;
}

export interface DocumentInfo {
  id: string;
  title: string;
  description: string;
  category: string;
  totalChunks: number;
  uploadedAt: string;
}

export class DocumentUploadService {
  private baseUrl: string = '/api';

  setBaseUrl(url: string) {
    this.baseUrl = url;
  }

  async uploadDocument(
    file: File, 
    request: DocumentUploadRequest, 
    sessionId: string,
    onProgress?: (progress: number) => void
  ): Promise<DocumentUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('metadata', JSON.stringify(request));

    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, '/documents/upload');
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const text = await response.text();
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }

    // 422 = 서버가 요청은 받았지만 콘텐츠 처리 실패 (FAILED status 동봉).
    // 422 도 DocumentUploadResponse 형태이므로 일반 흐름으로 통과시켜 status 검사로 처리.
    if (response.status === 422) {
      try {
        return JSON.parse(text);
      } catch {
        throw new Error(`Upload failed: 422 - ${text}`);
      }
    }

    if (!response.ok) {
      console.error('Upload error response:', text);
      throw new Error(`Upload failed: ${response.status} - ${text}`);
    }

    try {
      return JSON.parse(text);
    } catch {
      throw new Error(`Invalid JSON response: ${text}`);
    }
  }

  async getUserDocuments(sessionId: string): Promise<DocumentInfo[]> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, '/documents');
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Get documents failed: ${response.status}`);
    }

    return response.json();
  }

  async getDocument(documentId: string, sessionId: string): Promise<DocumentInfo> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, `/documents/${documentId}`);
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Get document failed: ${response.status}`);
    }

    return response.json();
  }

  async deleteDocument(documentId: string, sessionId: string): Promise<void> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const url = toAbsoluteUrl(this.baseUrl, `/documents/${documentId}`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Delete document failed: ${response.status}`);
    }
  }
}

export const documentUploadService = new DocumentUploadService();
