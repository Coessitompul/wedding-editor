import type { ChangeEvent } from 'react';
import { useRef } from 'react';
import type { Editor } from 'grapesjs';
import { toast } from 'sonner';
import { exportProjectAsJSON, exportProjectAsZip } from './exportProject';
import { importProjectFromJSON } from './importProject';

interface ExportImportPanelProps {
  editor: Editor;
}

export function ExportImportPanel({ editor }: ExportImportPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExportJSON = () => {
    exportProjectAsJSON(editor);
    toast.success('Project berhasil di-export sebagai JSON!');
  };

  const handleExportZip = () => {
    exportProjectAsZip(editor);
    toast.success('Mengekspor sebagai ZIP...');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    importProjectFromJSON(editor, file)
      .then(() => {
        toast.success('Project berhasil di-import!');
      })
      .catch((err: unknown) => {
        toast.error(`Gagal import: ${err instanceof Error ? err.message : String(err)}`);
      });

    // Reset supaya file yang sama bisa di-import ulang
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="export-import-panel">
      <span className="gjs-bottom-bar__label">Export:</span>

      <button
        className="export-import-panel__btn export-import-panel__btn--json"
        onClick={handleExportJSON}
        title="Export project sebagai file .json (bisa diedit kembali)"
      >
        JSON
      </button>

      <button
        className="export-import-panel__btn export-import-panel__btn--zip"
        onClick={handleExportZip}
        title="Export hasil sebagai ZIP (HTML + CSS siap publish)"
      >
        ZIP
      </button>

      <button
        className="export-import-panel__btn export-import-panel__btn--import"
        onClick={handleImportClick}
        title="Import project dari file .json"
      >
        Import
      </button>

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
