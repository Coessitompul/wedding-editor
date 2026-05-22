import type { Editor } from 'grapesjs';

export const registerRSVPBlock = (editor: Editor): void => {
  editor.BlockManager.add('wedding-rsvp', {
    label: 'RSVP',
    category: 'Wedding',
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <path d="M9 12l2 2 4-4"/>
      <path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
    </svg>`,
    content: `
      <section class="wb-rsvp" style="
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
        ">~ Konfirmasi Kehadiran ~</p>

        <h2 style="
          font-size: 28px;
          font-weight: normal;
          color: #3d2b29;
          margin: 0 0 8px;
        ">RSVP</h2>

        <p style="
          font-size: 13px;
          color: #8b6158;
          margin-bottom: 32px;
        ">Mohon konfirmasi kehadiran Anda sebelum 20 Desember 2025</p>

        <form style="
          max-width: 340px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 14px;
          text-align: left;
        ">
          <div>
            <label style="display: block; font-size: 12px; color: #8b6158; margin-bottom: 6px;">
              Nama Lengkap *
            </label>
            <input
              type="text"
              placeholder="Nama Anda"
              style="
                width: 100%;
                padding: 10px 14px;
                border: 1px solid #e8c5c0;
                border-radius: 6px;
                font-size: 14px;
                font-family: inherit;
                background: #fff;
                color: #3d2b29;
                box-sizing: border-box;
              "
            />
          </div>

          <div>
            <label style="display: block; font-size: 12px; color: #8b6158; margin-bottom: 6px;">
              Jumlah Tamu
            </label>
            <select style="
              width: 100%;
              padding: 10px 14px;
              border: 1px solid #e8c5c0;
              border-radius: 6px;
              font-size: 14px;
              font-family: inherit;
              background: #fff;
              color: #3d2b29;
              box-sizing: border-box;
            ">
              <option>1 orang</option>
              <option>2 orang</option>
              <option>3 orang</option>
              <option>4 orang</option>
            </select>
          </div>

          <div>
            <label style="display: block; font-size: 12px; color: #8b6158; margin-bottom: 10px;">
              Kehadiran
            </label>
            <div style="display: flex; gap: 16px;">
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #3d2b29; cursor: pointer;">
                <input type="radio" name="attendance" value="yes" style="accent-color: #f8b4c8;" />
                Hadir
              </label>
              <label style="display: flex; align-items: center; gap: 6px; font-size: 13px; color: #3d2b29; cursor: pointer;">
                <input type="radio" name="attendance" value="no" style="accent-color: #f8b4c8;" />
                Tidak Hadir
              </label>
            </div>
          </div>

          <button type="submit" style="
            padding: 12px;
            background: linear-gradient(135deg, #f8b4c8, #c9a09a);
            color: #3d2b29;
            border: none;
            border-radius: 6px;
            font-size: 14px;
            font-family: Georgia, serif;
            font-weight: bold;
            letter-spacing: 0.05em;
            cursor: pointer;
            margin-top: 4px;
          ">
            Konfirmasi Kehadiran
          </button>
        </form>
      </section>
    `,
  });
};
