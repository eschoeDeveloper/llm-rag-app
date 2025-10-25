import { PromptTemplate, PromptContext, PromptVariable } from '../types/prompt';

export class PromptService {
  private static instance: PromptService;
  private templates: Map<string, PromptTemplate> = new Map();

  static getInstance(): PromptService {
    if (!PromptService.instance) {
      PromptService.instance = new PromptService();
    }
    return PromptService.instance;
  }

  constructor() {
    this.initializeDefaultTemplates();
  }

  private initializeDefaultTemplates(): void {
    const defaultTemplates: PromptTemplate[] = [
      {
        id: 'general-qa',
        name: 'General Q&A',
        description: '일반적인 질문 답변을 위한 프롬프트',
        template: '사용자 질문: {userQuery}\n\n위 질문에 대해 정확하고 도움이 되는 답변을 제공해주세요.',
        variables: ['userQuery'],
        version: '1.0.0',
        category: 'general',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'rag-enhanced',
        name: 'RAG Enhanced',
        description: '검색 결과를 활용한 향상된 답변',
        template: `다음 검색 결과를 바탕으로 사용자의 질문에 답변해주세요:

검색 결과:
{searchResults}

사용자 질문: {userQuery}

위 검색 결과를 참고하여 정확하고 상세한 답변을 제공해주세요. 검색 결과에 없는 내용은 명시해주세요.`,
        variables: ['userQuery', 'searchResults'],
        version: '1.0.0',
        category: 'rag',
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      {
        id: 'analysis',
        name: 'Data Analysis',
        description: '데이터 분석 및 인사이트 도출',
        template: `다음 데이터를 분석하고 인사이트를 도출해주세요:

데이터: {data}
분석 요청: {userQuery}

분석 결과를 구조화된 형태로 제공하고, 주요 인사이트와 권장사항을 포함해주세요.`,
        variables: ['userQuery', 'data'],
        version: '1.0.0',
        category: 'analysis',
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    ];

    defaultTemplates.forEach(template => {
      this.templates.set(template.id, template);
    });
  }

  getTemplate(id: string): PromptTemplate | undefined {
    return this.templates.get(id);
  }

  getAllTemplates(): PromptTemplate[] {
    return Array.from(this.templates.values());
  }

  getTemplatesByCategory(category: string): PromptTemplate[] {
    return this.getAllTemplates().filter(template => template.category === category);
  }

  addTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): string {
    const id = this.generateId();
    const newTemplate: PromptTemplate = {
      ...template,
      id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    this.templates.set(id, newTemplate);
    return id;
  }

  updateTemplate(id: string, updates: Partial<PromptTemplate>): boolean {
    const template = this.templates.get(id);
    if (!template) return false;

    const updatedTemplate: PromptTemplate = {
      ...template,
      ...updates,
      updatedAt: Date.now()
    };
    this.templates.set(id, updatedTemplate);
    return true;
  }

  deleteTemplate(id: string): boolean {
    return this.templates.delete(id);
  }

  renderTemplate(templateId: string, context: PromptContext): string {
    const template = this.getTemplate(templateId);
    if (!template) {
      throw new Error(`Template not found: ${templateId}`);
    }

    let rendered = template.template;

    // 변수 치환
    template.variables.forEach(variable => {
      const value = this.getVariableValue(variable, context);
      const placeholder = `{${variable}}`;
      rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
    });

    return rendered;
  }

  private getVariableValue(variable: string, context: PromptContext): string {
    switch (variable) {
      case 'userQuery':
        return context.userQuery || '';
      case 'searchResults':
        return this.formatSearchResults(context.searchResults || []);
      case 'conversationHistory':
        return this.formatConversationHistory(context.conversationHistory || []);
      default:
        return context.metadata?.[variable] || '';
    }
  }

  private formatSearchResults(results: any[]): string {
    if (!results.length) return '검색 결과가 없습니다.';
    
    return results.map((result, index) => 
      `${index + 1}. ${typeof result.content === 'string' ? result.content : JSON.stringify(result.content)}\n   점수: ${result.score?.toFixed(3) || 'N/A'}\n   출처: ${result.source || 'Unknown'}`
    ).join('\n\n');
  }

  private formatConversationHistory(history: any[]): string {
    if (!history.length) return '대화 기록이 없습니다.';
    
    return history.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');
  }

  private generateId(): string {
    return `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  validateTemplate(template: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // 기본 검증
    if (!template.trim()) {
      errors.push('템플릿이 비어있습니다.');
    }

    // 변수 검증
    const variablePattern = /\{([^}]+)\}/g;
    const variables = template.match(variablePattern);
    
    if (variables) {
      variables.forEach(variable => {
        const varName = variable.slice(1, -1);
        if (!varName.trim()) {
          errors.push('빈 변수명이 있습니다.');
        }
      });
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
