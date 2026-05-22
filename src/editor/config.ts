import type { EditorConfig } from 'grapesjs';
import { editorPlugins } from './plugins';

interface EditorConfigOptions {
  storageKey?: string;
}

export const getEditorConfig = (options: EditorConfigOptions = {}): Partial<EditorConfig> => {
  const { storageKey } = options;

  return {
    fromElement: false,
    plugins: editorPlugins,
    dragMode: 'absolute',
    canvasCss: `
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; min-height: 100vh; height: auto; overflow-y: auto; overflow-x: hidden; }
      [data-gjs-type] { position: absolute !important; max-width: 100%; }
      [data-gjs-type]:not([data-gjs-type="wrapper"]) { cursor: grab; }
      [data-gjs-type="wrapper"] { position: relative !important; min-height: 100vh !important; width: 100% !important; max-width: none !important; cursor: default; outline: none !important; }
      .gjs-selected { outline: 2px solid #7c4dff !important; outline-offset: 2px; }
      .gjs-hovered:not(.gjs-selected) { outline: 1px dashed rgba(124,77,255,0.55) !important; outline-offset: 2px; }
      [data-gjs-type="wrapper"].gjs-selected, [data-gjs-type="wrapper"].gjs-hovered { outline: none !important; }
    `,

    // Storage Manager: autosave ke localStorage jika storageKey disediakan
    storageManager: storageKey
      ? {
          type: 'local',
          autosave: true,
          autoload: true,
          stepsBeforeSave: 1,
          id: `gjs-${storageKey}`,
        }
      : false,

    // Matikan panel default GrapesJS — dikelola manual oleh React component
    panels: { defaults: [] },

    // Block Manager: append ke elemen custom di luar canvas GrapesJS
    blockManager: {
      appendTo: '#gjs-blocks',
    },

    // Style Manager: append ke elemen custom
    styleManager: {
      appendTo: '#gjs-styles',
      sectors: [
        {
          name: 'Tipografi',
          properties: [
            'font-family',
            'font-size',
            'font-weight',
            'font-style',
            'text-align',
            'color',
            'line-height',
            'letter-spacing',
          ],
        },
        {
          name: 'Dimensi',
          properties: ['width', 'height', 'padding', 'margin'],
        },
        {
          name: 'Background',
          properties: [
            'background-color',
            'background-image',
            'background-size',
            'background-position',
            'background-repeat',
          ],
        },
        {
          name: 'Border',
          properties: ['border-radius', 'border', 'border-color', 'border-width', 'border-style'],
        },
        {
          name: 'Dekorasi',
          properties: ['opacity', 'box-shadow', 'transform'],
        },
      ],
    },

    // Layer Manager: append ke elemen custom
    layerManager: {
      appendTo: '#gjs-layers',
    },

    // Trait Manager: append ke elemen custom
    traitManager: {
      appendTo: '#gjs-traits',
    },

    // Device Manager: hanya Mobile
    deviceManager: {
      default: 'Mobile',
      devices: [
        { id: 'Mobile', name: 'Mobile', width: '400px', widthMedia: '' },
      ],
    },

    // Asset Manager
    assetManager: {
      embedAsBase64: false,
    },
  };
};
