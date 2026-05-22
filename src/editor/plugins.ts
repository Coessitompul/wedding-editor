import type { Editor, Plugin } from 'grapesjs';
import _blocksBasic from 'grapesjs-blocks-basic';
import _pluginForms from 'grapesjs-plugin-forms';
import pluginExport from 'grapesjs-plugin-export';
import styleBg from 'grapesjs-style-bg';

// CJS/ESM interop: Vite loads these as { default: fn }.
// GrapesJS unwraps .default internally for array plugins,
// but when calling inline (to pass options) we must unwrap manually.
const blocksBasicFn =
  ((_blocksBasic as unknown as { default: typeof _blocksBasic }).default) ?? _blocksBasic;
const pluginFormsFn =
  ((_pluginForms as unknown as { default: typeof _pluginForms }).default) ?? _pluginForms;

export const editorPlugins: Plugin[] = [
  // blocks:[] — prevents auto-registration; we register manually in FormBlocks.ts
  // so we control category order (Basic → Forms → Extra → Wedding)
  (editor: Editor) => blocksBasicFn(editor, { blocks: [], flexGrid: true }),
  (editor: Editor) => pluginFormsFn(editor, { blocks: [] }),
  pluginExport,
  styleBg,
];
