import type { Editor } from 'grapesjs';
import { registerBasicBlocks } from './BasicBlocks';
import { registerFormBlocks } from './FormBlocks';
import { registerCountdownBlock } from './CountdownBlock';
import { registerHeroBlock } from './HeroBlock';
import { registerGalleryBlock } from './GalleryBlock';
import { registerRSVPBlock } from './RSVPBlock';

// Registration order determines category order in the panel:
// Basic → Forms → Extra (Countdown) → Wedding
export const registerAllBlocks = (editor: Editor): void => {
  registerBasicBlocks(editor);
  registerFormBlocks(editor);
  registerCountdownBlock(editor);
  registerHeroBlock(editor);
  registerGalleryBlock(editor);
  registerRSVPBlock(editor);
};
