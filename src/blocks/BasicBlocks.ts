import type { Editor } from 'grapesjs';

// Row/Cell attribute strings matching grapesjs-blocks-basic flex grid behavior
const R = `class="gjs-row" data-gjs-droppable=".gjs-cell" data-gjs-resizable='{"tl":0,"tc":0,"tr":0,"cl":0,"cr":0,"bl":0,"br":0,"minDim":1}' data-gjs-name="Row"`;
const C = `class="gjs-cell" data-gjs-draggable=".gjs-row" data-gjs-resizable='{"cr":1,"bc":0,"currentUnit":1,"minDim":1,"step":0.2,"keyWidth":"flex-basis"}' data-gjs-name="Cell" data-gjs-unstylable='["width"]' data-gjs-stylable-require='["flex-basis"]'`;
const C30 = `${C} style="flex-basis:30%;"`;
const C70 = `${C} style="flex-basis:70%;"`;

// CSS injected once per canvas (idempotent — safe to repeat across blocks)
const GRID_STYLE = `<style>.gjs-row{display:flex;flex-wrap:nowrap;padding:10px;}.gjs-cell{flex-grow:1;flex-basis:100%;min-height:75px;}@media(max-width:768px){.gjs-row{flex-wrap:wrap;}}</style>`;

const SVG: Record<string, string> = {
  column1: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h20V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h20a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1Z"/></svg>`,
  column2: `<svg viewBox="0 0 23 24"><path fill="currentColor" d="M2 20h8V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM13 20h8V4h-8v16Zm-1 0V4a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-8a1 1 0 0 1-1-1Z"/></svg>`,
  column3: `<svg viewBox="0 0 23 24"><path fill="currentColor" d="M2 20h4V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM17 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1ZM9.5 20h4V4h-4v16Zm-1 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1Z"/></svg>`,
  column37: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M2 20h5V4H2v16Zm-1 0V4a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1ZM10 20h12V4H10v16Zm-1 0V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H10a1 1 0 0 1-1-1Z"/></svg>`,
  section: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2zm0 18H4V4h16v16zM6 6h12v2H6V6zm0 4h12v2H6v-2zm0 4h8v2H6v-2z"/></svg>`,
  divider: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M19 13H5v-2h14v2zM12 3l-4 4h3v4h2V7h3l-4-4zm0 18l4-4h-3v-4h-2v4H8l4 4z"/></svg>`,
  heading: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M4 4h3v16H4V4zm13 0h3v16h-3V4zM7 11h10v2H7v-2z"/></svg>`,
  text: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.5 4 19.66 8.35l-.96.26C18.25 7.74 17.79 6.87 17.26 6.43 16.73 6 16.11 6 15.5 6H13v10.5c0 .5 0 1 .33 1.25.34.25 1 .25 1.67.25V19H9v-1c.67 0 1.33 0 1.67-.25.33-.25.33-.75.33-1.25V6H8.5c-.61 0-1.23 0-1.76.43-.53.44-.99 1.31-1.44 2.18l-.96-.26L5.5 4h13z"/></svg>`,
  link: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1H11V7H7a5 5 0 0 0 0 10h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1M8 13h8v-2H8v2m9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.71-1.39 3.1-3.1 3.1h-4V17h4a5 5 0 0 0 0-10z"/></svg>`,
  linkBox: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm0 16H3V5h18v14zM6.9 12c0-1.15.93-2.1 2.1-2.1H11V8.5H9c-1.93 0-3.5 1.57-3.5 3.5S7.07 15.5 9 15.5h2v-1.4H9A2.1 2.1 0 0 1 6.9 12zm4.6 1H13v-2h-1.5v2zM15 8.5h-2v1.4h2A2.1 2.1 0 0 1 17.1 12c0 1.15-.93 2.1-2.1 2.1h-2v1.4h2c1.93 0 3.5-1.57 3.5-3.5S16.93 8.5 15 8.5z"/></svg>`,
  image: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21 3H3C2 3 1 4 1 5v14a2 2 0 0 0 2 2h18c1 0 2-1 2-2V5c0-1-1-2-2-2zM5 17l3.5-4.5 2.5 3 3.5-4.5L19 17H5z"/></svg>`,
  imageBox: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 16V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2zm-11-4-2.5 3.5L6 13l-4 5h16l-5-7-2 3zM2 19v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1H2zm6 1h8v1H8v-1z"/></svg>`,
  video: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M10 15 15.19 12 10 9v6m11.56-7.83c.13.47.22 1.1.28 1.9.07.8.1 1.49.1 2.09L22 12c0 2.19-.16 3.8-.44 4.83-.25.9-.83 1.48-1.73 1.73-.47.13-1.33.22-2.65.28-1.3.07-2.49.1-3.59.1L12 19c-4.19 0-6.8-.16-7.83-.44-.9-.25-1.48-.83-1.73-1.73-.13-.47-.22-1.1-.28-1.9-.07-.8-.1-1.49-.1-2.09L2 12c0-2.19.16-3.8.44-4.83.25-.9.83-1.48 1.73-1.73.47-.13 1.33-.22 2.65-.28 1.3-.07 2.49-.1 3.59-.1L12 5c4.19 0 6.8.16 7.83.44.9.25 1.48.83 1.73 1.73z"/></svg>`,
  map: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M20.5 3 20.34 3.03 15 5.1 9 3l-5.64 1.9C3.15 4.97 3 5.15 3 5.38V20.5A.5.5 0 0 0 3.5 21L3.66 20.97 9 18.9l6 2.1 5.64-1.9c.21-.07.36-.25.36-.48V3.5A.5.5 0 0 0 20.5 3zM10 5.47l4 1.4v11.66l-4-1.4V5.47zM5 6.46l3-.99v11.7l-3 1.16V6.46zm14 11.08-3 1.01V6.86l3-1.16v11.84z"/></svg>`,
  icon: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 2 9.5 8.26 3 9.27l4.5 4.38L6.18 20 12 17.27 17.82 20 16.5 13.65 21 9.27l-6.5-1.01L12 2z"/></svg>`,
  music: `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6zm-2 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/></svg>`,
};

export const registerBasicBlocks = (editor: Editor): void => {
  const bm = editor.BlockManager;
  // First block sets category with open:false; subsequent use string id
  const cat = { id: 'Basic', label: 'Basic', open: false };
  const catId = 'Basic';

  bm.add('column1', {
    label: '1 Column',
    category: cat,
    select: true,
    media: SVG.column1,
    content: `<div ${R}><div ${C}></div></div>${GRID_STYLE}`,
  });

  bm.add('column2', {
    label: '2 Columns',
    category: catId,
    select: true,
    media: SVG.column2,
    content: `<div ${R}><div ${C}></div><div ${C}></div></div>${GRID_STYLE}`,
  });

  bm.add('column3', {
    label: '3 Columns',
    category: catId,
    select: true,
    media: SVG.column3,
    content: `<div ${R}><div ${C}></div><div ${C}></div><div ${C}></div></div>${GRID_STYLE}`,
  });

  bm.add('column3-7', {
    label: '2 Columns 3/7',
    category: catId,
    select: true,
    media: SVG.column37,
    content: `<div ${R}><div ${C30}></div><div ${C70}></div></div>${GRID_STYLE}`,
  });

  bm.add('section', {
    label: 'Section',
    category: catId,
    select: true,
    media: SVG.section,
    content: `<section style="padding:40px 20px;min-height:100px;"></section>`,
  });

  bm.add('divider', {
    label: 'Divider',
    category: catId,
    select: true,
    media: SVG.divider,
    content: `<hr style="border:none;border-top:2px solid currentColor;margin:20px 0;opacity:0.25;">`,
  });

  bm.add('heading', {
    label: 'Heading',
    category: catId,
    select: true,
    activate: true,
    media: SVG.heading,
    content: { type: 'text', tagName: 'h1', content: 'Your Heading', style: { margin: '0', padding: '5px 0', 'font-size': '2em' } },
  });

  bm.add('text', {
    label: 'Text',
    category: catId,
    select: true,
    activate: true,
    media: SVG.text,
    content: { type: 'text', content: 'Insert your text here', style: { margin: '0', padding: '5px 0' } },
  });

  bm.add('link', {
    label: 'Link',
    category: catId,
    select: true,
    media: SVG.link,
    content: { type: 'link', content: 'Link Text', style: { color: '#d983a6' } },
  });

  bm.add('link-box', {
    label: 'Link Box',
    category: catId,
    select: true,
    media: SVG.linkBox,
    content: `<a href="#" style="display:block;padding:20px;border:2px solid rgba(255,255,255,0.2);text-decoration:none;color:inherit;text-align:center;border-radius:4px;min-height:80px;"></a>`,
  });

  bm.add('image', {
    label: 'Image',
    category: catId,
    select: true,
    activate: true,
    media: SVG.image,
    content: { type: 'image', style: { color: 'black', display: 'block', 'max-width': '100%', height: 'auto' } },
  });

  bm.add('image-box', {
    label: 'Image Box',
    category: catId,
    select: true,
    media: SVG.imageBox,
    content: `<figure style="margin:0;padding:0;"><img src="" alt="Image" style="display:block;width:100%;max-height:300px;object-fit:cover;"><figcaption style="padding:8px 0;font-size:14px;text-align:center;">Image caption</figcaption></figure>`,
  });

  bm.add('video', {
    label: 'Video',
    category: catId,
    select: true,
    media: SVG.video,
    content: { type: 'video', src: '', style: { height: '350px', 'max-width': '100%', margin: '0 auto', display: 'block' } },
  });

  bm.add('map', {
    label: 'Map',
    category: catId,
    select: true,
    media: SVG.map,
    content: { type: 'map', style: { height: '350px', width: '100%' } },
  });

  bm.add('icon', {
    label: 'Icon',
    category: catId,
    select: true,
    media: SVG.icon,
    content: `<div style="display:inline-flex;align-items:center;justify-content:center;padding:10px;"><svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 9.5 8.26 3 9.27l4.5 4.38L6.18 20 12 17.27 17.82 20 16.5 13.65 21 9.27l-6.5-1.01L12 2z"/></svg></div>`,
  });

  bm.add('music', {
    label: 'Music',
    category: catId,
    select: true,
    media: SVG.music,
    content: `
      <div class="wb-music-player" style="
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 16px;
        background: rgba(0,0,0,0.35);
        border-radius: 50px;
        width: 100%;
        box-sizing: border-box;
        font-family: sans-serif;
      ">
        <button onclick="(function(btn){
          var p = btn.closest('.wb-music-player').querySelector('audio');
          if(!p) return;
          if(p.paused){ p.play(); btn.textContent='⏸'; } else { p.pause(); btn.textContent='▶'; }
        })(this)" style="
          width: 38px;
          height: 38px;
          border-radius: 50%;
          border: none;
          background: #d4af37;
          color: #1a1a1a;
          font-size: 14px;
          cursor: pointer;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
        ">▶</button>
        <div style="flex:1;min-width:0;">
          <div style="font-size:13px;font-weight:600;color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            Judul Lagu
          </div>
          <div style="font-size:11px;color:rgba(255,255,255,0.6);margin-top:2px;">
            Nama Artis
          </div>
        </div>
        <audio src="" loop style="display:none;"></audio>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="rgba(255,255,255,0.5)">
          <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6zm-2 16a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>
        </svg>
      </div>
    `,
  });
};
