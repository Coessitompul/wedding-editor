import { useState } from 'react';
import { useEditorStore } from '@/store/editorStore';
import type { AIProviderType } from '@/types';

const AI_PROVIDERS: { value: AIProviderType; label: string }[] = [
  { value: 'claude', label: 'Claude (Anthropic)' },
  { value: 'openai', label: 'OpenAI ChatGPT' },
  { value: 'gemini', label: 'Google Gemini' },
  { value: 'groq', label: 'Groq' },
];

export function AIPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const { activeAIProvider, setActiveAIProvider } = useEditorStore();

  if (!isOpen) {
    return (
      <button
        className="ai-panel-toggle"
        onClick={() => setIsOpen(true)}
        title="AI Assistant (Coming Soon)"
      >
        ✨ AI
      </button>
    );
  }

  return (
    <div className="ai-panel">
      <div className="ai-panel__header">
        <span className="ai-panel__title">AI Assistant</span>
        <span className="ai-panel__badge">Coming Soon</span>
        <button className="ai-panel__close" onClick={() => setIsOpen(false)}>
          ✕
        </button>
      </div>

      <div className="ai-panel__body">
        <div>
          <p className="ai-panel__label">Provider AI</p>
          <select
            className="ai-panel__select"
            value={activeAIProvider}
            onChange={(e) => setActiveAIProvider(e.target.value as AIProviderType)}
            disabled
          >
            {AI_PROVIDERS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <p className="ai-panel__label">Deskripsikan yang ingin dibuat</p>
          <textarea
            className="ai-panel__textarea"
            placeholder='Contoh: "Buatkan website pernikahan elegan untuk Sarah & Budi, 12 Desember 2025, tema royal purple"'
            disabled
          />
        </div>

        <button
          className="ai-panel__generate-btn"
          disabled
          title="Fitur ini akan segera hadir"
        >
          ✨ Generate Layout
        </button>

        <p className="ai-panel__hint">
          Fitur AI akan tersedia di Tahap 2 pengembangan.
          <br />
          API key TIDAK BOLEH di-hardcode — gunakan backend proxy.
        </p>
      </div>
    </div>
  );
}
