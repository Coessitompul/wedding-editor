import type { AIProviderType } from '@/types';
import { claudeProvider } from './claude';
import { openaiProvider } from './openai';
import { geminiProvider } from './gemini';
import { groqProvider } from './groq';

export interface AIProvider {
  name: string;
  generate: (prompt: string, systemPrompt?: string) => Promise<string>;
}

export const getAIProvider = (provider: AIProviderType): AIProvider => {
  switch (provider) {
    case 'claude':
      return claudeProvider;
    case 'openai':
      return openaiProvider;
    case 'gemini':
      return geminiProvider;
    case 'groq':
      return groqProvider;
  }
};
