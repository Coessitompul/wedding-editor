// Type declarations untuk GrapesJS plugins yang belum punya bundled TypeScript types.
// Jika di masa depan plugin-plugin ini menambahkan types sendiri, file ini bisa dihapus.
declare module 'grapesjs-blocks-basic' {
  import type { Plugin } from 'grapesjs';
  const plugin: Plugin;
  export default plugin;
}

declare module 'grapesjs-plugin-forms' {
  import type { Plugin } from 'grapesjs';
  const plugin: Plugin;
  export default plugin;
}

declare module 'grapesjs-plugin-export' {
  import type { Plugin } from 'grapesjs';
  const plugin: Plugin;
  export default plugin;
}

declare module 'grapesjs-style-bg' {
  import type { Plugin } from 'grapesjs';
  const plugin: Plugin;
  export default plugin;
}
