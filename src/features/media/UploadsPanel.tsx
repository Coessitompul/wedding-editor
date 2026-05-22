import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import type { MediaItem } from './mediaDb';
import { deleteMedia, getAllMedia, readFileAsDataUrl, saveMedia, setCurrentDragItem } from './mediaDb';

type MediaTab = 'image' | 'video' | 'audio';

const LABEL: Record<MediaTab, string> = { image: 'Gambar', video: 'Video', audio: 'Audio' };

const SIZE_LIMIT: Record<MediaTab, number> = {
  image: 15 * 1024 * 1024,   // 15 MB
  video: 100 * 1024 * 1024,  // 100 MB
  audio: 20 * 1024 * 1024,   // 20 MB
};

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

function detectType(file: File): MediaTab | null {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  if (file.type.startsWith('audio/')) return 'audio';
  return null;
}

// ── Sub-components ─────────────────────────────────────────────────

function IconDelete() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconAudio() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}

function IconPlay() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function EmptyState({ tab }: { tab: MediaTab }) {
  const icons: Record<MediaTab, JSX.Element> = {
    image: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
    video: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <polygon points="23 7 16 12 23 17 23 7" />
        <rect x="1" y="5" width="15" height="14" rx="2" />
      </svg>
    ),
    audio: (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    ),
  };
  return (
    <div className="ws-uploads-empty">
      {icons[tab]}
      <p className="ws-uploads-empty__title">Belum ada {LABEL[tab].toLowerCase()}</p>
      <p className="ws-uploads-empty__sub">Unggah {LABEL[tab].toLowerCase()} di atas</p>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

interface UploadsPanelProps {
  onInsert: (item: MediaItem) => void;
}

export function UploadsPanel({ onInsert }: UploadsPanelProps) {
  const [tab, setTab] = useState<MediaTab>('image');
  const [items, setItems] = useState<MediaItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getAllMedia()
      .then((all) => setItems(all.sort((a, b) => b.uploadedAt - a.uploadedAt)))
      .catch(() => toast.error('Gagal memuat media'));
  }, []);

  const filtered = items.filter((m) => m.type === tab);

  const processFiles = useCallback(async (files: File[]) => {
    for (const file of files) {
      const type = detectType(file);
      if (!type) {
        toast.error(`Format tidak didukung: ${file.name}`);
        continue;
      }
      if (file.size > SIZE_LIMIT[type]) {
        toast.error(`${file.name} terlalu besar (maks ${formatSize(SIZE_LIMIT[type])})`);
        continue;
      }
      try {
        const dataUrl = await readFileAsDataUrl(file);
        const item: MediaItem = {
          id: crypto.randomUUID(),
          name: file.name,
          type,
          mimeType: file.type,
          size: file.size,
          dataUrl,
          uploadedAt: Date.now(),
        };
        await saveMedia(item);
        setItems((prev) => [item, ...prev]);
        setTab(type);
        toast.success(`${file.name} berhasil diunggah`);
      } catch {
        toast.error(`Gagal mengunggah ${file.name}`);
      }
    }
  }, []);

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    await processFiles(Array.from(e.dataTransfer.files));
  };

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      await processFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await deleteMedia(id);
    setItems((prev) => prev.filter((m) => m.id !== id));
    toast.info('Media dihapus');
  };

  return (
    <div className="ws-uploads-panel">
      {/* ── 3 Tabs ── */}
      <div className="ws-media-tabs">
        {(['image', 'video', 'audio'] as MediaTab[]).map((t) => (
          <button
            key={t}
            className={`ws-media-tab${tab === t ? ' ws-media-tab--active' : ''}`}
            onClick={() => setTab(t)}
          >
            {LABEL[t]}
          </button>
        ))}
      </div>

      {/* ── Upload zone ── */}
      <div
        className={`ws-upload-zone${dragging ? ' ws-upload-zone--drag' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
          <polyline points="17 8 12 3 7 8" />
          <line x1="12" y1="3" x2="12" y2="15" />
        </svg>
        <span>Klik atau seret file {LABEL[tab].toLowerCase()} ke sini</span>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          style={{ display: 'none' }}
          onChange={handleFileInput}
        />
      </div>

      {/* ── Content area ── */}
      {filtered.length === 0 ? (
        <EmptyState tab={tab} />
      ) : tab === 'audio' ? (
        // Audio — list view
        <div className="ws-audio-list">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="ws-audio-item"
              onClick={() => onInsert(item)}
              title={`Klik untuk memasukkan ke canvas: ${item.name}`}
            >
              <div className="ws-audio-icon">
                <IconAudio />
              </div>
              <div className="ws-audio-info">
                <span className="ws-audio-name">{item.name}</span>
                <span className="ws-audio-size">{formatSize(item.size)}</span>
              </div>
              <button
                className="ws-media-delete"
                onClick={(e) => handleDelete(item.id, e)}
                title="Hapus"
              >
                <IconDelete />
              </button>
            </div>
          ))}
        </div>
      ) : (
        // Image / Video — grid thumbnails
        <div className="ws-media-grid">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="ws-media-thumb"
              draggable={true}
              onDragStart={(e) => {
                setCurrentDragItem(item);
                e.dataTransfer.setData('application/x-ws-studio', 'media');
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setDragImage(e.currentTarget as HTMLElement, 40, 40);
              }}
              onDragEnd={() => setCurrentDragItem(null)}
              onClick={() => onInsert(item)}
              title={`Seret ke canvas atau klik untuk memasukkan: ${item.name}`}
            >
              {item.type === 'image' ? (
                <img src={item.dataUrl} alt={item.name} className="ws-media-thumb__img" loading="lazy" draggable={false} />
              ) : (
                <div className="ws-media-thumb__video-wrap">
                  <video src={item.dataUrl} className="ws-media-thumb__img" />
                  <div className="ws-media-thumb__play-overlay">
                    <IconPlay />
                  </div>
                </div>
              )}
              <button
                className="ws-media-delete ws-media-delete--thumb"
                onClick={(e) => handleDelete(item.id, e)}
                title="Hapus"
              >
                <IconDelete />
              </button>
              <div className="ws-media-thumb__name">{item.name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
