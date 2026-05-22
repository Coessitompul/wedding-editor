import type { AIProvider } from './index';

// Tahap 2: implementasi fetch ke Google Gemini API
export const geminiProvider: AIProvider = {
  name: 'Google Gemini',
  generate: async (_prompt: string, _systemPrompt?: string): Promise<string> => {
    throw new Error('Gemini provider belum diimplementasi. Lihat Tahap 2 di CLAUDE.md.');
  },
};
