import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';

// GrapesEditor WAJIB lazy-loaded — tidak boleh import langsung karena GrapesJS butuh DOM
const GrapesEditor = lazy(() => import('./editor/GrapesEditor'));

export default function App() {
  return (
    <>
      <Suspense fallback={<div className="editor-loading">Memuat Wedding Studio...</div>}>
        <GrapesEditor
          theme="wedding"
          storageKey="wedding-studio-v1"
          showAIPanel={true}
        />
      </Suspense>
      <Toaster position="bottom-right" richColors />
    </>
  );
}
