import { useState, useCallback } from 'react';
import { PromptService } from '../services/PromptService.ts';
import { PromptTemplate, PromptContext } from '../types/prompt.ts';

export function usePromptEngine() {
  const [promptService] = useState(() => PromptService.getInstance());
  const [selectedTemplate, setSelectedTemplate] = useState<string>('general-qa');
  const [customPrompt, setCustomPrompt] = useState<string>('');

  const getTemplates = useCallback(() => {
    return promptService.getAllTemplates();
  }, [promptService]);

  const getTemplate = useCallback((id: string) => {
    return promptService.getTemplate(id);
  }, [promptService]);

  const renderPrompt = useCallback((context: PromptContext) => {
    if (customPrompt.trim()) {
      return customPrompt;
    }
    
    try {
      return promptService.renderTemplate(selectedTemplate, context);
    } catch (error) {
      console.error('Prompt rendering error:', error);
      return context.userQuery;
    }
  }, [promptService, selectedTemplate, customPrompt]);

  const validatePrompt = useCallback((prompt: string) => {
    return promptService.validateTemplate(prompt);
  }, [promptService]);

  const addTemplate = useCallback((template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    return promptService.addTemplate(template);
  }, [promptService]);

  const updateTemplate = useCallback((id: string, updates: Partial<PromptTemplate>) => {
    return promptService.updateTemplate(id, updates);
  }, [promptService]);

  const deleteTemplate = useCallback((id: string) => {
    return promptService.deleteTemplate(id);
  }, [promptService]);

  return {
    selectedTemplate,
    setSelectedTemplate,
    customPrompt,
    setCustomPrompt,
    getTemplates,
    getTemplate,
    renderPrompt,
    validatePrompt,
    addTemplate,
    updateTemplate,
    deleteTemplate
  };
}

