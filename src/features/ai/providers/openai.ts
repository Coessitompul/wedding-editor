import type { AIProvider } from './index';

// Tahap 2: implementasi fetch ke OpenAI API
export const openaiProvider: AIProvider = {
  name: 'OpenAI ChatGPT',
  generate: async (_prompt: string, _systemPrompt?: string): Promise<string> => {
    throw new Error('OpenAI provider belum diimplementasi. Lihat Tahap 2 di CLAUDE.md.');
  },
};
