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

    // Device Manager: Mobile (default) / Tablet / Desktop
    deviceManager: {
      default: 'Mobile',
      devices: [
        { id: 'Desktop', name: 'Desktop', width: '' },
        { id: 'Tablet',  name: 'Tablet',  width: '768px', widthMedia: '768px' },
        { id: 'Mobile',  name: 'Mobile',  width: '400px', widthMedia: '' },
      ],
    },

    // Asset Manager
    assetManager: {
      embedAsBase64: false,
    },
  };
};
