import type { AIProvider } from './index';

// Tahap 2: implementasi fetch ke Groq API
export const groqProvider: AIProvider = {
  name: 'Groq',
  generate: async (_prompt: string, _systemPrompt?: string): Promise<string> => {
    throw new Error('Groq provider belum diimplementasi. Lihat Tahap 2 di CLAUDE.md.');
  },
};
