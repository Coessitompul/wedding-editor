import type { Editor } from 'grapesjs';
import type { ProjectData } from '@/types';

export const exportProjectAsJSON = (
  editor: Editor,
  projectName: string = 'wedding-project',
): void => {
  const projectData: ProjectData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    projectName,
    data: editor.getProjectData(),
  };

  const blob = new Blob([JSON.stringify(projectData, null, 2)], {
    type: 'application/json',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${projectName}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportProjectAsZip = (editor: Editor): void => {
  // grapesjs-plugin-export menyediakan command ini
  editor.runCommand('gjs-export-zip');
};
