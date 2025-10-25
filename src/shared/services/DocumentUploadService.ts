// Native fetch implementation - no http dependency

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

    const response = await fetch(`${this.baseUrl}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Upload error response:', errorText);
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const text = await response.text();
    console.log('Upload response text:', text);
    
    if (!text || text.trim() === '') {
      throw new Error('Empty response from server');
    }

    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('Failed to parse JSON:', text);
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

    const response = await fetch(`${this.baseUrl}/documents`, {
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

    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
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

    const response = await fetch(`${this.baseUrl}/documents/${documentId}`, {
      method: 'DELETE',
      headers,
    });

    if (!response.ok) {
      throw new Error(`Delete document failed: ${response.status}`);
    }
  }
}

export const documentUploadService = new DocumentUploadService();
