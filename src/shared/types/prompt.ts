export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  template: string;
  variables: string[];
  version: string;
  category: 'general' | 'rag' | 'analysis' | 'creative';
  createdAt: number;
  updatedAt: number;
}

export interface PromptVariable {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'array';
  required: boolean;
  defaultValue?: any;
  description?: string;
}

export interface PromptContext {
  userQuery: string;
  searchResults?: SearchResult[];
  conversationHistory?: Message[];
  metadata?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  content: string;
  score: number;
  metadata: Record<string, any>;
  source?: string;
}

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    model?: string;
    tokens?: number;
    searchResults?: SearchResult[];
    promptTemplate?: string;
    processingTime?: number;
    sessionId?: string;
  };
  error?: boolean;
}

export interface RAGConfig {
  topK: number;
  threshold: number;
  maxTokens: number;
  temperature: number;
  searchMode: 'similarity' | 'mmr' | 'hybrid';
}

export interface ChatResponse {
  content: string;
  sessionId?: string;
  metadata: {
    model: string;
    tokens: number;
    searchResults?: SearchResult[];
    promptTemplate?: string;
    processingTime?: number;
  };
}

