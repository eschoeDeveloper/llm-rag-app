// import { http } from '../api/http.ts';

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

    const response = await http.post('/documents/upload', formData, {
      headers: {
        ...headers,
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  async getUserDocuments(sessionId: string): Promise<DocumentInfo[]> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.get('/documents', { headers });
    return response.data;
  }

  async getDocument(documentId: string, sessionId: string): Promise<DocumentInfo> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    const response = await http.get(`/documents/${documentId}`, { headers });
    return response.data;
  }

  async deleteDocument(documentId: string, sessionId: string): Promise<void> {
    const headers: Record<string, string> = {};
    if (sessionId) {
      headers['X-Session-ID'] = sessionId;
    }

    await http.delete(`/documents/${documentId}`, { headers });
  }
}

export const documentUploadService = new DocumentUploadService();
