import type { Editor } from 'grapesjs';
import type { ProjectData } from '@/types';

export const importProjectFromJSON = (editor: Editor, file: File): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result;
        if (typeof raw !== 'string') {
          throw new Error('Gagal membaca isi file.');
        }

        const projectData = JSON.parse(raw) as ProjectData;

        if (!projectData.data || !projectData.version) {
          throw new Error('File tidak valid atau format tidak dikenal.');
        }

        editor.loadProjectData(projectData.data);
        resolve();
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsText(file);
  });
};
