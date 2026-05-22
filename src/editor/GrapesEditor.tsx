import grapesjs from 'grapesjs';
import type { Editor } from 'grapesjs';
import 'grapesjs/dist/css/grapes.min.css';
import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { toast } from 'sonner';
import { registerAllBlocks } from '@/blocks';
import { AIPanel } from '@/features/ai/AIPanel';
import { exportProjectAsJSON, exportProjectAsZip } from '@/features/export-import/exportProject';
import { importProjectFromJSON } from '@/features/export-import/importProject';
import type { MediaItem } from '@/features/media/mediaDb';
import { UploadsPanel } from '@/features/media/UploadsPanel';
import type { GrapesEditorProps } from '@/types';
import { getEditorConfig } from './config';

// ── Inline SVG icons ─────────────────────────────────────────────────
function IconBlocks() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconLayers() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5" />
      <path d="M2 12l10 5 10-5" />
    </svg>
  );
}

function IconCode() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function IconDesktop() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  );
}

function IconTablet() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="2" width="16" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconMobile() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function IconUndo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 14L4 9l5-5" />
      <path d="M4 9h11a6 6 0 010 12h-1" />
    </svg>
  );
}

function IconRedo() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 14l5-5-5-5" />
      <path d="M20 9H9a6 6 0 000 12h1" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function IconUpload() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="4" rx="1" />
      <path d="M17.5 14v6M14.5 17h6" />
    </svg>
  );
}

// ── Component ────────────────────────────────────────────────────────
type LeftMode = 'blocks' | 'layers' | 'uploads';
type RightTab = 'styles' | 'properties';
type DeviceId = 'Desktop' | 'Tablet' | 'Mobile';

// WAJIB diimport via React.lazy() dari parent — GrapesJS butuh DOM.
export default function GrapesEditor({
  onSave,
  onLoad,
  theme = 'default',
  initialHtml,
  height = '100vh',
  showAIPanel = true,
  storageKey,
}: GrapesEditorProps) {
  const editorRef = useRef<Editor | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [leftMode, setLeftMode] = useState<LeftMode>('blocks');
  const [rightTab, setRightTab] = useState<RightTab>('styles');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDevice, setActiveDevice] = useState<DeviceId>('Mobile');

  useEffect(() => {
    const editor = grapesjs.init({
      container: '#gjs',
      ...getEditorConfig({ storageKey }),
    });

    registerAllBlocks(editor);

    if (initialHtml) {
      editor.setComponents(initialHtml);
    }

    editor.Commands.add('save-db', {
      run: (ed: Editor) => {
        const html = ed.getHtml();
        const css = ed.getCss() ?? '';
        if (onSave) {
          Promise.resolve(onSave(html, css))
            .then(() => toast.success('Project berhasil disimpan!'))
            .catch((err: unknown) => {
              toast.error(`Gagal menyimpan: ${err instanceof Error ? err.message : String(err)}`);
            });
        } else {
          toast.success('Project disimpan ke localStorage!');
        }
      },
    });

    editor.Keymaps.add('ns:save', 'ctrl:83, cmd:83', 'save-db');

    if (onLoad) onLoad(editor);

    editorRef.current = editor;
    setIsReady(true);

    return () => {
      editor.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // dependency array HARUS kosong

  useEffect(() => {
    if (!isReady) return;
    const q = searchQuery.toLowerCase().trim();
    const blockEls = document.querySelectorAll<HTMLElement>('#gjs-blocks .gjs-block');
    blockEls.forEach((el) => {
      const label = el.querySelector('.gjs-block-label')?.textContent?.toLowerCase() ?? '';
      el.style.display = !q || label.includes(q) ? '' : 'none';
    });
    const catEls = document.querySelectorAll<HTMLElement>('#gjs-blocks .gjs-block-category');
    catEls.forEach((cat) => {
      const hasVisible = Array.from(cat.querySelectorAll<HTMLElement>('.gjs-block')).some(
        (b) => b.style.display !== 'none',
      );
      cat.style.display = !q || hasVisible ? '' : 'none';
    });
  }, [searchQuery, isReady]);

  const switchDevice = (device: DeviceId) => {
    setActiveDevice(device);
    editorRef.current?.setDevice(device);
  };

  const handleUndo = () => editorRef.current?.runCommand('core:undo');
  const handleRedo = () => editorRef.current?.runCommand('core:redo');
  const handlePreview = () => editorRef.current?.runCommand('core:preview');
  const handleSave = () => editorRef.current?.runCommand('save-db');

  const handleExportJSON = () => {
    if (!editorRef.current) return;
    exportProjectAsJSON(editorRef.current);
    toast.success('Export JSON berhasil!');
  };

  const handleExportZip = () => {
    if (!editorRef.current) return;
    exportProjectAsZip(editorRef.current);
    toast.info('Mengekspor sebagai ZIP...');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editorRef.current) return;
    importProjectFromJSON(editorRef.current, file)
      .then(() => toast.success('Import berhasil!'))
      .catch((err: unknown) =>
        toast.error(`Gagal import: ${err instanceof Error ? err.message : String(err)}`),
      );
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleInsertMedia = (item: MediaItem) => {
    const editor = editorRef.current;
    if (!editor) return;
    const selected = editor.getSelected();
    if (item.type === 'image') {
      if (selected && selected.getEl()?.tagName === 'IMG') {
        selected.set({ attributes: { src: item.dataUrl, alt: item.name } });
      } else {
        editor.addComponents(
          `<img src="${item.dataUrl}" alt="${item.name}" style="max-width:100%;display:block;" />`,
        );
      }
      toast.success('Gambar ditambahkan ke canvas');
    } else if (item.type === 'video') {
      editor.addComponents(
        `<video src="${item.dataUrl}" controls style="max-width:100%;display:block;"></video>`,
      );
      toast.success('Video ditambahkan ke canvas');
    } else {
      editor.addComponents(
        `<audio src="${item.dataUrl}" controls style="width:100%;"></audio>`,
      );
      toast.success('Audio ditambahkan ke canvas');
    }
  };

  return (
    <div className="ws-editor" data-theme={theme} style={{ height }}>

      {/* ── Icon strip ──────────────────────────────────────────── */}
      <div className="ws-icon-strip">
        <div className="ws-icon-strip__top">
          <button
            className={`ws-icon-btn${leftMode === 'blocks' ? ' ws-icon-btn--active' : ''}`}
            onClick={() => setLeftMode('blocks')}
            title="Blocks"
          >
            <IconBlocks />
          </button>
          <button
            className={`ws-icon-btn${leftMode === 'layers' ? ' ws-icon-btn--active' : ''}`}
            onClick={() => setLeftMode('layers')}
            title="Layers"
          >
            <IconLayers />
          </button>
          <button
            className={`ws-icon-btn${leftMode === 'uploads' ? ' ws-icon-btn--active' : ''}`}
            onClick={() => setLeftMode('uploads')}
            title="Unggahan"
          >
            <IconUpload />
          </button>
        </div>

        {showAIPanel && (
          <div className="ws-icon-strip__ai">
            <AIPanel />
          </div>
        )}
      </div>

      {/* ── Left panel ──────────────────────────────────────────── */}
      <div className="ws-left-panel">
        <div className="ws-panel-header">
          <span className="ws-panel-title">
            {leftMode === 'blocks' ? 'Blocks' : leftMode === 'layers' ? 'Layers' : 'Unggahan'}
          </span>
        </div>

        {leftMode === 'blocks' && (
          <div className="ws-seg-group">
            <button className="ws-seg-btn ws-seg-btn--active">Regular</button>
            <button className="ws-seg-btn">Symbols</button>
          </div>
        )}

        {leftMode === 'blocks' && (
          <div className="ws-search-wrap">
            <input
              type="text"
              className="ws-search-input"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        {/* GrapesJS block manager — selalu di DOM, toggle via CSS */}
        <div
          id="gjs-blocks"
          className={`ws-panel-scroll${leftMode !== 'blocks' ? ' ws-hidden' : ''}`}
        />
        <div
          id="gjs-layers"
          className={`ws-panel-scroll${leftMode !== 'layers' ? ' ws-hidden' : ''}`}
        />

        {/* ── Unggahan panel ── */}
        {leftMode === 'uploads' && (
          <UploadsPanel onInsert={handleInsertMedia} />
        )}

        {leftMode === 'blocks' && (
          <button className="ws-add-blocks-btn" onClick={handleImportClick} title="Import project JSON">
            <span className="ws-add-blocks-btn__icon">⊞</span>
            Add more blocks
          </button>
        )}
      </div>

      {/* ── Canvas wrapper ──────────────────────────────────────── */}
      <div className="ws-canvas-wrapper">

        {/* Canvas topbar */}
        <div className="ws-canvas-topbar">
          <div className="ws-topbar-left">
            <button className="ws-code-btn">
              <IconCode />
              <span>Code</span>
            </button>
          </div>

          <div className="ws-topbar-center">
            <div className="ws-device-group">
              <button
                className={`ws-device-seg${activeDevice === 'Desktop' ? ' ws-device-seg--active' : ''}`}
                onClick={() => switchDevice('Desktop')}
                title="Desktop"
              >
                <IconDesktop />
              </button>
              <button
                className={`ws-device-seg${activeDevice === 'Tablet' ? ' ws-device-seg--active' : ''}`}
                onClick={() => switchDevice('Tablet')}
                title="Tablet"
              >
                <IconTablet />
              </button>
              <button
                className={`ws-device-seg${activeDevice === 'Mobile' ? ' ws-device-seg--active' : ''}`}
                onClick={() => switchDevice('Mobile')}
                title="Mobile"
              >
                <IconMobile />
              </button>
            </div>
            <div className="ws-topbar-divider" />
            <button className="ws-tool-btn" onClick={handleUndo} title="Undo (Ctrl+Z)">
              <IconUndo />
            </button>
            <button className="ws-tool-btn" onClick={handleRedo} title="Redo (Ctrl+Y)">
              <IconRedo />
            </button>
            <button className="ws-tool-btn ws-tool-btn--play" onClick={handlePreview} title="Preview">
              <IconPlay />
            </button>
          </div>

          <div className="ws-topbar-right">
            <button
              className="ws-btn-export"
              onClick={handleExportZip}
              title="Export ZIP"
            >
              ZIP
            </button>
            <button
              className="ws-btn-export"
              onClick={handleExportJSON}
              title="Export JSON"
            >
              JSON
            </button>
            {isReady && (
              <button className="ws-publish-btn" onClick={handleSave}>
                Publish
              </button>
            )}
          </div>
        </div>

        {/* GrapesJS canvas */}
        <div id="gjs" className="ws-canvas" />
      </div>

      {/* ── Right panel ─────────────────────────────────────────── */}
      <div className="ws-right-panel">
        <div className="ws-right-tab-bar">
          <button
            className={`ws-right-tab${rightTab === 'styles' ? ' ws-right-tab--active' : ''}`}
            onClick={() => setRightTab('styles')}
          >
            Styles
          </button>
          <button
            className={`ws-right-tab${rightTab === 'properties' ? ' ws-right-tab--active' : ''}`}
            onClick={() => setRightTab('properties')}
          >
            Properties
          </button>
        </div>

        {/* GrapesJS style manager & trait manager — selalu di DOM */}
        <div
          id="gjs-styles"
          className={`ws-panel-scroll${rightTab !== 'styles' ? ' ws-hidden' : ''}`}
        />
        <div
          id="gjs-traits"
          className={`ws-panel-scroll${rightTab !== 'properties' ? ' ws-hidden' : ''}`}
        />
      </div>

      {/* Hidden file input untuk import */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </div>
  );
}
