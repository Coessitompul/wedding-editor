import type { AIProvider } from './index';

// Tahap 2: implementasi fetch ke Anthropic API
export const claudeProvider: AIProvider = {
  name: 'Claude (Anthropic)',
  generate: async (_prompt: string, _systemPrompt?: string): Promise<string> => {
    throw new Error('Claude provider belum diimplementasi. Lihat Tahap 2 di CLAUDE.md.');
  },
};
