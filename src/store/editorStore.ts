import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProviderType, ThemeType } from '@/types';

interface EditorStore {
  aiStatus: 'idle' | 'loading' | 'error' | 'success';
  aiLastResponse: string;
  setAiStatus: (status: EditorStore['aiStatus']) => void;
  setAiLastResponse: (content: string) => void;

  activeTheme: ThemeType;
  activeAIProvider: AIProviderType;
  setActiveTheme: (theme: ThemeType) => void;
  setActiveAIProvider: (provider: AIProviderType) => void;

  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      aiStatus: 'idle',
      aiLastResponse: '',
      setAiStatus: (aiStatus) => set({ aiStatus }),
      setAiLastResponse: (aiLastResponse) => set({ aiLastResponse }),

      activeTheme: 'wedding',
      activeAIProvider: 'claude',
      setActiveTheme: (activeTheme) => set({ activeTheme }),
      setActiveAIProvider: (activeAIProvider) => set({ activeAIProvider }),

      isExportModalOpen: false,
      setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
    }),
    {
      name: 'wedding-studio-preferences',
      // Hanya simpan preferences ke localStorage, bukan runtime state
      partialize: (state) => ({
        activeTheme: state.activeTheme,
        activeAIProvider: state.activeAIProvider,
      }),
    },
  ),
);
