import type { Editor } from 'grapesjs';

export const registerHeroBlock = (editor: Editor): void => {
  editor.BlockManager.add('wedding-hero', {
    label: 'Cover Hero',
    category: { id: 'Wedding', label: 'Wedding', open: false },
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="2" y="3" width="20" height="14" rx="2"/>
      <path d="M8 21h8M12 17v4"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>`,
    content: `
      <section class="wb-hero" style="
        background: linear-gradient(135deg, #2d1b69 0%, #7b5ea7 100%);
        padding: 80px 20px;
        text-align: center;
        color: #ffffff;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-family: Georgia, serif;
        position: relative;
        overflow: hidden;
      ">
        <p style="
          font-size: 13px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 16px;
        ">~ Undangan Pernikahan ~</p>

        <h1 style="
          font-size: 42px;
          font-weight: normal;
          color: #ffffff;
          margin: 0 0 8px;
          line-height: 1.2;
        ">Nama Pengantin</h1>

        <p style="
          font-size: 20px;
          color: #d4af37;
          margin: 0 0 24px;
          font-style: italic;
        ">&</p>

        <h1 style="
          font-size: 42px;
          font-weight: normal;
          color: #ffffff;
          margin: 0 0 32px;
          line-height: 1.2;
        ">Nama Pasangan</h1>

        <div style="
          width: 60px;
          height: 2px;
          background: #d4af37;
          margin: 0 auto 24px;
        "></div>

        <p style="
          font-size: 16px;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.1em;
        ">Sabtu, 01 Januari 2026</p>

        <p style="
          font-size: 14px;
          color: rgba(255,255,255,0.65);
          margin-top: 8px;
        ">Jakarta, Indonesia</p>
      </section>
    `,
  });
};
