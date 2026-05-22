import type { Editor, ProjectData as GjsProjectData } from 'grapesjs';

export interface GrapesEditorProps {
  onSave?: (html: string, css: string) => void | Promise<void>;
  onLoad?: (editor: Editor) => void;
  theme?: ThemeType;
  initialHtml?: string;
  /** Default: '100vh'. Contoh: 'calc(100vh - 64px)' */
  height?: string;
  /** Default: true — tampil tapi disabled di Tahap 1 */
  showAIPanel?: boolean;
  /** Key localStorage untuk autosave GrapesJS */
  storageKey?: string;
}

export interface ProjectData {
  version: string;
  exportedAt: string;
  projectName: string;
  data: GjsProjectData;
}

export type AIProviderType = 'claude' | 'openai' | 'gemini' | 'groq';

export type ThemeType = 'wedding' | 'minimal' | 'default';
