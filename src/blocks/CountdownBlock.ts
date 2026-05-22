import type { Editor } from 'grapesjs';

export const registerCountdownBlock = (editor: Editor): void => {
  editor.BlockManager.add('wedding-countdown', {
    label: 'Countdown',
    category: { id: 'Extra', label: 'Extra', open: false },
    media: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 3"/>
    </svg>`,
    content: `
      <section class="wb-countdown" style="
        background: #2d1b69;
        padding: 60px 20px;
        text-align: center;
        color: #ffffff;
        font-family: Georgia, serif;
      ">
        <p style="
          font-size: 11px;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: #d4af37;
          margin-bottom: 8px;
        ">~ Menuju Hari Bahagia ~</p>

        <h2 style="
          font-size: 24px;
          font-weight: normal;
          margin: 0 0 32px;
          color: #ffffff;
        ">Hitung Mundur</h2>

        <div style="
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        ">
          <div style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(212,175,55,0.4);
            border-radius: 8px;
            padding: 16px 20px;
            min-width: 70px;
          ">
            <div id="wb-days" style="
              font-size: 36px;
              font-weight: bold;
              color: #d4af37;
              line-height: 1;
            ">--</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px; letter-spacing: 0.1em;">HARI</div>
          </div>
          <div style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(212,175,55,0.4);
            border-radius: 8px;
            padding: 16px 20px;
            min-width: 70px;
          ">
            <div id="wb-hours" style="
              font-size: 36px;
              font-weight: bold;
              color: #d4af37;
              line-height: 1;
            ">--</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px; letter-spacing: 0.1em;">JAM</div>
          </div>
          <div style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(212,175,55,0.4);
            border-radius: 8px;
            padding: 16px 20px;
            min-width: 70px;
          ">
            <div id="wb-minutes" style="
              font-size: 36px;
              font-weight: bold;
              color: #d4af37;
              line-height: 1;
            ">--</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px; letter-spacing: 0.1em;">MENIT</div>
          </div>
          <div style="
            background: rgba(255,255,255,0.1);
            border: 1px solid rgba(212,175,55,0.4);
            border-radius: 8px;
            padding: 16px 20px;
            min-width: 70px;
          ">
            <div id="wb-seconds" style="
              font-size: 36px;
              font-weight: bold;
              color: #d4af37;
              line-height: 1;
            ">--</div>
            <div style="font-size: 11px; color: rgba(255,255,255,0.7); margin-top: 6px; letter-spacing: 0.1em;">DETIK</div>
          </div>
        </div>

        <p style="
          margin-top: 28px;
          font-size: 14px;
          color: rgba(255,255,255,0.7);
          font-style: italic;
        ">Sabtu, 01 Januari 2026</p>

        <script>
          (function() {
            var target = new Date('2026-01-01T00:00:00').getTime();
            function update() {
              var now = new Date().getTime();
              var diff = target - now;
              if (diff <= 0) return;
              var d = document.getElementById('wb-days');
              var h = document.getElementById('wb-hours');
              var m = document.getElementById('wb-minutes');
              var s = document.getElementById('wb-seconds');
              if (d) d.textContent = String(Math.floor(diff / 86400000));
              if (h) h.textContent = String(Math.floor((diff % 86400000) / 3600000));
              if (m) m.textContent = String(Math.floor((diff % 3600000) / 60000));
              if (s) s.textContent = String(Math.floor((diff % 60000) / 1000));
            }
            update();
            setInterval(update, 1000);
          })();
        </script>
      </section>
    `,
  });
};
