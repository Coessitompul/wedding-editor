import type { Editor } from 'grapesjs';

export const registerGalleryBlock = (editor: Editor): void => {
  editor.BlockManager.add('wedding-gallery', {
    label: 'Foto Gallery',
    category: 'Wedding',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="3" width="7" height="7" rx="1"/>
      <rect x="14" y="3" width="7" height="7" rx="1"/>
      <rect x="3" y="14" width="7" height="7" rx="1"/>
      <rect x="14" y="14" width="7" height="7" rx="1"/>
    </svg>`,
    content: `
      <section class="wb-gallery" style="
        background: #fdfaf4;
        padding: 60px 20px;
        font-family: Georgia, serif;
        text-align: center;
      ">
        <p style="
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #c9a09a;
          margin-bottom: 8px;
        ">~ Momen Berharga ~</p>

        <h2 style="
          font-size: 28px;
          font-weight: normal;
          color: #3d2b29;
          margin: 0 0 32px;
        ">Galeri Foto</h2>

        <div style="
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 6px;
          max-width: 400px;
          margin: 0 auto;
        ">
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #f8b4c8, #fdf6ec);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c9a09a;
            font-size: 24px;
          ">🌸</div>
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #fdf6ec, #d4af37);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8b6158;
            font-size: 24px;
          ">💕</div>
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #f8b4c8, #c9a09a);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fdfaf4;
            font-size: 24px;
          ">🌹</div>
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #d4af37, #fdf6ec);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #8b6158;
            font-size: 24px;
          ">✨</div>
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #c9a09a, #f8b4c8);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fdfaf4;
            font-size: 24px;
          ">🎀</div>
          <div style="
            aspect-ratio: 1;
            background: linear-gradient(135deg, #fdf6ec, #f8b4c8);
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #c9a09a;
            font-size: 24px;
          ">💍</div>
        </div>

        <p style="
          margin-top: 20px;
          font-size: 12px;
          color: #c9a09a;
          font-style: italic;
        ">Ganti foto dengan mengklik setiap kotak</p>
      </section>
    `,
  });
};
