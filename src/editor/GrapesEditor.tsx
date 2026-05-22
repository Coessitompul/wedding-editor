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
import { currentDragItem, setCurrentDragItem } from '@/features/media/mediaDb';
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
  const [selectedCount, setSelectedCount] = useState(0);

  useEffect(() => {
    const editor = grapesjs.init({
      container: '#gjs',
      ...getEditorConfig({ storageKey }),
    });

    registerAllBlocks(editor);

    // Pastikan semua non-wrapper component punya 8 resize handle (Canva-like)
    editor.on('component:add', (comp: import('grapesjs').Component) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const c = comp as any;
      if (c.get?.('type') === 'wrapper') return;
      if (!c.get('resizable')) {
        c.set('resizable', { tl: 1, tc: 1, tr: 1, cl: 1, cr: 1, bl: 1, bc: 1, br: 1, minDim: 10 });
      }
    });

    // Pastikan wrapper selalu droppable dan punya reference frame yang benar
    const wrapper = editor.getWrapper();
    if (wrapper) {
      wrapper.set({ droppable: true });
    }

    // Semua setup canvas dilakukan setelah iframe siap
    editor.on('load', () => {
      const frameDoc =
        (editor.Canvas as unknown as { getDocument?: () => Document }).getDocument?.() ??
        editor.Canvas.getFrameEl()?.contentDocument;
      if (!frameDoc) return;

      // ── 1. Drop gambar dari uploads panel (capture phase agar mendahului GrapesJS) ──
      frameDoc.addEventListener('dragover', (e: DragEvent) => {
        if (Array.from(e.dataTransfer?.types ?? []).includes('application/x-ws-studio')) {
          e.preventDefault();
          e.stopPropagation();
          if (e.dataTransfer) e.dataTransfer.dropEffect = 'copy';
        }
      }, true);

      frameDoc.addEventListener('drop', (e: DragEvent) => {
        const isOurs = Array.from(e.dataTransfer?.types ?? []).includes('application/x-ws-studio');
        const item = currentDragItem;
        if (!isOurs || !item || item.type !== 'image') return;
        e.preventDefault();
        e.stopPropagation();
        setCurrentDragItem(null);
        const scrollX = frameDoc.defaultView?.scrollX ?? 0;
        const scrollY = frameDoc.defaultView?.scrollY ?? 0;
        const x = Math.round(e.clientX + scrollX);
        const y = Math.round(e.clientY + scrollY);
        editor.addComponents(
          `<img src="${item.dataUrl}" alt="${item.name}" style="position:absolute;top:${y}px;left:${x}px;max-width:300px;height:auto;display:block;" />`,
        );
        toast.success('Gambar ditambahkan ke canvas');
      }, true);

      // ── 2. Canvas interactions ──
      const wrapperEl = editor.getWrapper()?.getEl();
      if (wrapperEl) {

        // ── 2a. Rubber band multi-select ───────────────────────────
        const rb = { active: false, startX: 0, startY: 0 };

        const selBox = frameDoc.createElement('div');
        selBox.style.cssText =
          'position:fixed;border:2px dashed #7c4dff;background:rgba(124,77,255,0.1);' +
          'pointer-events:none;display:none;z-index:9999;box-sizing:border-box;border-radius:2px;';
        frameDoc.body.appendChild(selBox);

        frameDoc.addEventListener('mousedown', (e: MouseEvent) => {
          if (e.button !== 0) return;
          const target = e.target as Element;
          if (target !== wrapperEl && target !== frameDoc.body) return;
          rb.active = true;
          rb.startX = e.clientX;
          rb.startY = e.clientY;
          Object.assign(selBox.style, { left: rb.startX + 'px', top: rb.startY + 'px', width: '0px', height: '0px', display: 'block' });
          editor.select(undefined);
        }, false);

        frameDoc.addEventListener('mousemove', (e: MouseEvent) => {
          if (!rb.active) return;
          const x = Math.min(e.clientX, rb.startX);
          const y = Math.min(e.clientY, rb.startY);
          Object.assign(selBox.style, {
            left: x + 'px', top: y + 'px',
            width: Math.abs(e.clientX - rb.startX) + 'px',
            height: Math.abs(e.clientY - rb.startY) + 'px',
          });
        }, false);

        frameDoc.addEventListener('mouseup', (e: MouseEvent) => {
          if (!rb.active) return;
          rb.active = false;
          selBox.style.display = 'none';
          const minX = Math.min(e.clientX, rb.startX);
          const minY = Math.min(e.clientY, rb.startY);
          const maxX = Math.max(e.clientX, rb.startX);
          const maxY = Math.max(e.clientY, rb.startY);
          if (maxX - minX < 5 && maxY - minY < 5) return;
          let first = true;
          editor.getWrapper()?.components().each((comp: import('grapesjs').Component) => {
            const el = comp.getEl();
            if (!el) return;
            const r = el.getBoundingClientRect();
            if (r.left < maxX && r.right > minX && r.top < maxY && r.bottom > minY) {
              if (first) { editor.select(comp); first = false; }
              else editor.select(comp, { add: true } as never);
            }
          });
        }, false);

        // ── Bounds clamping — real-time via MutationObserver ──
        // GrapesJS Resizer memanipulasi el.style langsung saat drag resize,
        // sehingga component:update saja tidak cukup. MutationObserver menangkap
        // perubahan DOM secara real-time dan langsung mengoreksinya.
        const CLAMP_W = 400;
        const MIN_EL = 20;
        let domClamping = false;
        const FrameMO = (frameDoc.defaultView as Window & typeof globalThis).MutationObserver;
        const boundsObserver = new FrameMO((mutations) => {
          if (domClamping) return;
          domClamping = true;
          for (const mut of mutations) {
            if (mut.type !== 'attributes') continue;
            const el = mut.target as HTMLElement;
            if (el === wrapperEl || !el.style?.left) continue;
            const left = parseFloat(el.style.left) || 0;
            const top  = parseFloat(el.style.top)  || 0;
            const width = parseFloat(el.style.width) || 0;
            // Pertahankan right edge, clamp left >= 0 dan right <= CLAMP_W
            const rightEdge  = Math.min(left + width, CLAMP_W);
            const newLeft    = Math.max(0, left);
            const newTop     = Math.max(0, top);
            const newWidth   = width > 0 ? Math.max(MIN_EL, rightEdge - newLeft) : 0;
            if (Math.abs(newLeft  - left)  > 0.5) el.style.left  = `${Math.round(newLeft)}px`;
            if (Math.abs(newTop   - top)   > 0.5) el.style.top   = `${Math.round(newTop)}px`;
            if (newWidth > 0 && Math.abs(newWidth - width) > 0.5) el.style.width = `${Math.round(newWidth)}px`;
          }
          domClamping = false;
        });
        boundsObserver.observe(wrapperEl, { subtree: true, attributes: true, attributeFilter: ['style'] });

        // ── 2b. Direct element drag (Canva-like) ──
        // Bubble phase: GrapesJS selection jalan dulu, baru kita setup drag state
        // Capture phase untuk pointermove: intercept sebelum GrapesJS hover effects
        {
          let dragComp: import('grapesjs').Component | null = null;
          let dragEl: HTMLElement | null = null;
          let dragSX = 0, dragSY = 0;
          let dragIL = 0, dragIT = 0;
          let dragActive = false;

          frameDoc.addEventListener('pointerdown', (e: PointerEvent) => {
            if (e.button !== 0) return;
            const target = e.target as HTMLElement;
            if (target.classList.contains('gjs-resizer-h')) return;
            const comp = editor.getSelected();
            if (!comp) return;
            const el = comp.getEl();
            if (!el || (!el.contains(target) && el !== target)) return;
            dragComp   = comp;
            dragEl     = el;
            dragSX     = e.clientX;
            dragSY     = e.clientY;
            dragIL     = parseFloat(el.style.left) || 0;
            dragIT     = parseFloat(el.style.top)  || 0;
            dragActive = false;
          }, false);

          frameDoc.addEventListener('pointermove', (e: PointerEvent) => {
            if (!dragEl || !dragComp || !(e.buttons & 1)) {
              if (dragActive) { dragComp = null; dragEl = null; dragActive = false; }
              return;
            }
            const dx = e.clientX - dragSX;
            const dy = e.clientY - dragSY;
            if (!dragActive && Math.abs(dx) < 3 && Math.abs(dy) < 3) return;
            dragActive = true;
            e.stopPropagation();
            e.preventDefault();
            dragEl.style.left = `${Math.round(Math.max(0, dragIL + dx))}px`;
            dragEl.style.top  = `${Math.round(Math.max(0, dragIT + dy))}px`;
          }, true);

          frameDoc.addEventListener('pointerup', () => {
            if (!dragEl || !dragComp || !dragActive) {
              dragComp = null; dragEl = null; dragActive = false; return;
            }
            const newLeft = parseFloat(dragEl.style.left) || 0;
            const newTop  = parseFloat(dragEl.style.top)  || 0;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const style = (dragComp as any).getStyle() as Record<string, string>;
            isClamping = true;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (dragComp as any).setStyle({ ...style, left: `${newLeft}px`, top: `${newTop}px` });
            isClamping = false;
            dragComp = null; dragEl = null; dragActive = false;
          }, true);
        }
      }

      // ── 3. Delete key untuk hapus semua element yang dipilih ──
      frameDoc.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key !== 'Delete' && e.key !== 'Backspace') return;
        const active = frameDoc.activeElement;
        if (active && (active.tagName === 'INPUT' || active.tagName === 'TEXTAREA' || (active as HTMLElement).isContentEditable)) return;
        editor.runCommand('core:component-delete');
      }, false);
    });

    // Update jumlah element yang terpilih untuk tombol delete di topbar
    editor.on('component:selected', () => {
      setSelectedCount(((editor as unknown as { getSelectedAll: () => unknown[] }).getSelectedAll?.() ?? []).length);
    });
    editor.on('component:deselected', () => {
      setSelectedCount(((editor as unknown as { getSelectedAll: () => unknown[] }).getSelectedAll?.() ?? []).length);
    });

    // ── 5. Bounds clamping — sinkronisasi model GrapesJS setelah resize/drag selesai ──
    // MutationObserver (di atas) menangani DOM real-time. Handler ini memastikan
    // nilai model GrapesJS juga ter-update dengan benar setelah perubahan di-commit.
    const CANVAS_W = 400;
    const MIN_W = 20;
    let isClamping = false;

    const clampToBounds = (comp: import('grapesjs').Component) => {
      if (isClamping) return;
      if ((comp as unknown as { get: (k: string) => string }).get?.('type') === 'wrapper') return;

      const style = comp.getStyle() as Record<string, string>;
      if (!style.left && !style.top) return;

      const left  = parseFloat(style.left  ?? '0') || 0;
      const top   = parseFloat(style.top   ?? '0') || 0;
      const width = parseFloat(style.width ?? '0') || 0;

      // Pertahankan right edge — sama dengan formula MutationObserver di atas
      const rightEdge = Math.min(left + width, CANVAS_W);
      const newLeft   = Math.max(0, left);
      const newTop    = Math.max(0, top);
      const newWidth  = width > 0 ? Math.max(MIN_W, rightEdge - newLeft) : 0;

      const needsUpdate =
        Math.abs(newLeft - left) > 0.5 ||
        Math.abs(newTop  - top)  > 0.5 ||
        (newWidth > 0 && Math.abs(newWidth - width) > 0.5);

      if (needsUpdate) {
        isClamping = true;
        comp.setStyle({
          ...style,
          left: `${Math.round(newLeft)}px`,
          top:  `${Math.round(newTop)}px`,
          ...(newWidth > 0 ? { width: `${Math.round(newWidth)}px` } : {}),
        });
        isClamping = false;
      }
    };

    editor.on('component:update', (comp: import('grapesjs').Component) => {
      clampToBounds(comp);
    });

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

  const handleUndo = () => editorRef.current?.runCommand('core:undo');
  const handleRedo = () => editorRef.current?.runCommand('core:redo');
  const handleDeleteSelected = () => editorRef.current?.runCommand('core:component-delete');
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
          `<img src="${item.dataUrl}" alt="${item.name}" style="position:absolute;top:50px;left:50px;max-width:300px;height:auto;display:block;" />`,
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
            {selectedCount > 0 && (
              <button
                className="ws-btn-delete"
                onClick={handleDeleteSelected}
                title={`Hapus ${selectedCount} element`}
              >
                ✕ {selectedCount}
              </button>
            )}
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
