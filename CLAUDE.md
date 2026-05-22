# CLAUDE.md — Wedding Studio

Dokumen ini adalah panduan utama untuk Claude Code agar memahami konteks, arsitektur,
keputusan teknis, dan aturan pengembangan project ini secara menyeluruh.

Baca dokumen ini sepenuhnya sebelum menulis kode apapun.

---

## Gambaran Project

Ini adalah **template repo** — bukan library, bukan package npm. Tujuannya adalah
menjadi starting point yang bisa di-clone ke project manapun, lalu dimodifikasi
bebas sesuai kebutuhan project tersebut tanpa ada constraint dari framework eksternal.

Filosofi utama: **mudah dimengerti, mudah dimodifikasi, mudah di-embed.**

Ketika developer mengambil repo ini, mereka harus bisa langsung paham apa yang
terjadi di setiap file tanpa perlu membaca dokumentasi eksternal yang panjang.
Oleh karena itu, hindari abstraksi yang tidak perlu. Kode yang sedikit tapi jelas
lebih baik dari kode yang "pintar" tapi sulit dibaca.

**Stack utama:**
- React 19
- Vite 6
- TypeScript 5 (strict mode)
- GrapesJS 0.22.16 open source (bukan Studio SDK yang berbayar)
- Zustand 5.0.13 (state management ringan untuk UI state di luar editor)
- Sonner 2.0.7 (toast notifications)

**Kenapa Vite, bukan Next.js:**
GrapesJS adalah library yang 100% client-side dan sangat bergantung pada DOM.
Next.js dengan SSR-nya menyebabkan masalah serius karena GrapesJS mencoba mengakses
`window` dan `document` di server, yang tidak ada. Workaround-nya (dynamic import
dengan `ssr: false`) berantai ke mana-mana dan membuat kode jadi kotor. Vite
menghindari semua masalah ini karena pure client-side dari awal.

**Tujuan pertama project ini:** Wedding web builder — user bisa drag & drop elemen,
edit konten, export hasilnya, dan di masa depan menggunakan AI assistant untuk
generate teks atau layout berdasarkan tema dan informasi pernikahan mereka.

---

## Prioritas Pengembangan

Ini adalah urutan yang HARUS diikuti. Jangan melompat ke tahap berikutnya
sebelum tahap sebelumnya solid dan teruji.

```
Tahap 1 — Editor Foundation (SEKARANG)
  ├── GrapesJS embed yang stabil dan terisolasi
  ├── Custom blocks wedding (Hero, Gallery, Countdown, RSVP, dll)
  ├── Save & Load project (localStorage + export/import file)
  ├── Export HTML + CSS hasil kerja user
  └── UI yang nyaman: panel, toolbar, theme preset

Tahap 2 — AI Integration (NANTI, setelah Tahap 1 selesai)
  ├── Placeholder menu AI sudah ada di UI sejak Tahap 1
  ├── Tapi logic AI tidak diimplementasi dulu
  ├── Multi-provider: Claude, OpenAI, Gemini, Groq
  └── AI generate teks, caption, hingga full layout
```

**Mengapa urutan ini penting:** AI yang bagus di atas editor yang rapuh tetap
menghasilkan pengalaman buruk. Pondasi harus kuat dulu sebelum fitur lanjutan
dibangun di atasnya. Selain itu, debugging editor + debugging AI secara bersamaan
adalah pengalaman yang sangat melelahkan dan tidak produktif.

---

## Dependensi & Status Library

Sebelum menginstall atau menyarankan library apapun, Claude Code WAJIB memverifikasi
bahwa library tersebut masih aktif di-maintain dan kompatibel dengan stack yang ada.
Jangan pernah menginstall library berdasarkan ingatan atau asumsi — selalu cek npm
atau dokumentasi resminya terlebih dahulu.

### Library yang Dipakai (Terverifikasi per Mei 2026)

| Library | Versi | Status | Keterangan |
|---------|-------|--------|------------|
| `grapesjs` | 0.22.16 | ✅ Aktif | Core editor, update rutin |
| `@grapesjs/react` | 2.0.0 | ✅ Aktif | Official React wrapper |
| `zustand` | 5.0.13 | ✅ Aktif | 34 juta download/minggu |
| `sonner` | 2.0.7 | ✅ Aktif | Toast notifications |
| `grapesjs-blocks-basic` | 1.0.2 | ⚠️ Stabil | Jarang update tapi kompatibel |
| `grapesjs-plugin-forms` | 2.0.6 | ⚠️ Stabil | Jarang update tapi kompatibel |
| `grapesjs-plugin-export` | 1.0.12 | ⚠️ Stabil | Jarang update tapi kompatibel |
| `grapesjs-style-bg` | 2.0.2 | ⚠️ Stabil | Jarang update tapi kompatibel |

> **Tentang plugin GrapesJS yang "stabil":**
> Plugin-plugin ini dibuat oleh tim GrapesJS sendiri dan sudah mature.
> Mereka jarang diupdate bukan karena abandoned, tapi karena sudah tidak perlu
> banyak perubahan. Tetap kompatibel dengan GrapesJS 0.22.x.
> Jika ada plugin yang error, solusi utamanya adalah membuat custom block sendiri
> di `src/blocks/` — yang memang sudah jadi pendekatan utama project ini.

> **`@types/grapesjs` TIDAK ADA dan TIDAK PERLU diinstall.**
> GrapesJS 0.22.x sudah bundle TypeScript types di dalam package utamanya.

> **`grapesjs-plugin-ckeditor` sengaja tidak dipakai.**
> GrapesJS 0.22.x sudah punya built-in RTE yang cukup untuk kebutuhan ini.

### Yang Sengaja TIDAK Dipakai
- `@types/grapesjs` — tidak ada, types sudah bundled di core
- `grapesjs-plugin-ckeditor` — built-in RTE GrapesJS sudah cukup
- `@tanstack/react-query` — call AI sederhana, tidak butuh caching layer ini
- `react-router-dom` — template ini single-page, tidak butuh routing
- `axios` — fetch native sudah cukup
- `@grapesjs/studio-sdk` — berbayar, project ini pakai open source

---

## Struktur Project

```
root/
├── public/
├── src/
│   ├── main.tsx                      # Entry point React, mount ke #root
│   ├── App.tsx                       # Root component
│   │
│   ├── editor/
│   │   ├── GrapesEditor.tsx          # Komponen utama editor (SELALU lazy loaded)
│   │   ├── config.ts                 # Fungsi yang return object konfigurasi GrapesJS
│   │   └── plugins.ts                # Array plugin yang akan diaktifkan di editor
│   │
│   ├── blocks/                       # Semua custom drag-and-drop blocks
│   │   ├── index.ts                  # Entry point: register semua blocks ke editor
│   │   ├── HeroBlock.ts              # Hero section (nama pasangan, tanggal, foto)
│   │   ├── GalleryBlock.ts           # Photo gallery grid
│   │   ├── CountdownBlock.ts         # Countdown timer menuju hari H
│   │   └── RSVPBlock.ts              # Form RSVP untuk tamu
│   │
│   ├── features/
│   │   ├── export-import/
│   │   │   ├── exportProject.ts      # Export project sebagai JSON / ZIP
│   │   │   ├── importProject.ts      # Import project dari file JSON
│   │   │   └── ExportImportPanel.tsx # UI panel export & import di dalam editor
│   │   │
│   │   └── ai/                       # Fitur AI — UI placeholder ada, logic menyusul
│   │       ├── providers/
│   │       │   ├── index.ts          # Unified interface, entry point semua provider
│   │       │   ├── claude.ts         # Anthropic Claude (Tahap 2)
│   │       │   ├── openai.ts         # OpenAI ChatGPT (Tahap 2)
│   │       │   ├── gemini.ts         # Google Gemini (Tahap 2)
│   │       │   └── groq.ts           # Groq (Tahap 2)
│   │       ├── prompts.ts            # Prompt templates per use case (Tahap 2)
│   │       └── AIPanel.tsx           # UI panel AI — tampil di sidebar, disabled dulu
│   │
│   ├── store/
│   │   └── editorStore.ts            # Zustand store untuk UI state di luar GrapesJS
│   │
│   ├── themes/
│   │   ├── index.ts                  # Export semua tema
│   │   ├── wedding.ts                # Tema wedding: warna, font, spacing presets
│   │   └── minimal.ts                # Tema minimal/modern
│   │
│   ├── types/
│   │   └── index.ts                  # TypeScript types & interfaces bersama
│   │
│   └── styles/
│       ├── editor.css                # CSS isolasi WAJIB untuk container editor
│       └── global.css                # Global styles minimal
│
├── .env.local                        # Environment variables (JANGAN commit ke git)
├── .env.example                      # Template env vars yang boleh di-commit
├── .gitignore
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── CLAUDE.md                         # Dokumen ini
```

---

## Aturan Penting Pengembangan

### 1. GrapesJS & DOM — Paling Krusial

GrapesJS adalah **client-side only**. Ia mencoba mengakses `window`, `document`,
dan DOM element saat inisialisasi. Ini berarti:

**WAJIB:** Komponen `GrapesEditor` harus selalu diimport dengan `React.lazy()`.

```tsx
// ✅ BENAR — lazy load
const GrapesEditor = lazy(() => import('@/editor/GrapesEditor'));

// ❌ SALAH — jangan pernah import langsung di level module
import GrapesEditor from '@/editor/GrapesEditor';
```

**WAJIB:** Inisialisasi GrapesJS hanya boleh di dalam `useEffect` dengan
dependency array kosong, dan harus di-destroy saat unmount.

```ts
useEffect(() => {
  const editor = grapesjs.init({
    container: '#gjs',
    ...getEditorConfig(),
  });

  registerAllBlocks(editor);

  return () => {
    editor.destroy(); // WAJIB — mencegah memory leak
  };
}, []); // dependency array HARUS kosong
```

**WAJIB:** Jangan pernah menyimpan instance editor GrapesJS di dalam Zustand store
atau React state. Simpan di `useRef`.

```ts
// ✅ BENAR
const editorRef = useRef<grapesjs.Editor | null>(null);

// ❌ SALAH
const [editor, setEditor] = useState(null);
```

---

### 2. CSS Isolation — Wajib untuk Embed

Tiga sumber masalah saat GrapesJS di-embed:
- **A. Height tidak eksplisit** — editor collapse atau tidak terlihat
- **B. Overflow hidden pada parent** — dropdown, color picker terpotong
- **C. Z-index conflict** — modal GrapesJS tertutup elemen parent

Solusi wajib — selalu gunakan class `gjs-editor-wrapper`:

```css
/* src/styles/editor.css */
.gjs-editor-wrapper {
  position: relative;
  width: 100%;
  height: 100vh;            /* WAJIB eksplisit */
  overflow: visible;        /* JANGAN hidden */
  isolation: isolate;       /* Cegah z-index conflict */
}

.gjs-editor-wrapper .gjs-mdl-dialog,
.gjs-editor-wrapper [class*="gjs-"] {
  z-index: 9999;
}
```

Override `height` lewat prop jika ada navbar di atas editor:
```tsx
<GrapesEditor height="calc(100vh - 64px)" />
```

---

### 3. Export & Import Project

Fitur ini bagian dari **Tahap 1** dan harus selesai sebelum AI disentuh.

**Export Project sebagai JSON** (untuk disimpan & diedit lagi):
```ts
// src/features/export-import/exportProject.ts
import type { Editor } from 'grapesjs';

export interface ProjectData {
  version: string;
  exportedAt: string;
  projectName: string;
  data: object; // GrapesJS project data mentah
}

export const exportProjectAsJSON = (
  editor: Editor,
  projectName: string = 'wedding-project'
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
```

**Export Hasil sebagai ZIP** (HTML + CSS siap publish):
```ts
export const exportProjectAsZip = (editor: Editor): void => {
  editor.runCommand('gjs-export-zip'); // dari grapesjs-plugin-export
};
```

**Import Project dari JSON**:
```ts
// src/features/export-import/importProject.ts
import type { Editor } from 'grapesjs';
import type { ProjectData } from './exportProject';

export const importProjectFromJSON = async (
  editor: Editor,
  file: File
): Promise<void> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const raw = e.target?.result as string;
        const projectData: ProjectData = JSON.parse(raw);

        if (!projectData.data || !projectData.version) {
          throw new Error('File tidak valid atau format tidak dikenal.');
        }

        editor.loadProjectData(projectData.data);
        resolve();
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error('Gagal membaca file.'));
    reader.readAsText(file);
  });
};
```

---

### 4. Custom Blocks — Konvensi Penamaan

```ts
// src/blocks/NamaBlock.ts
import type { Editor } from 'grapesjs';

export const registerNamaBlock = (editor: Editor): void => {
  editor.BlockManager.add('nama-block', {
    label: 'Nama Block',
    category: 'Wedding',
    content: `<div class="nama-block">...</div>`,
    media: `<svg>...</svg>`,
  });
};
```

Register di `src/blocks/index.ts`:
```ts
import type { Editor } from 'grapesjs';
import { registerHeroBlock } from './HeroBlock';
import { registerNamaBlock } from './NamaBlock';

export const registerAllBlocks = (editor: Editor): void => {
  registerHeroBlock(editor);
  registerNamaBlock(editor);
};
```

---

### 5. AI Integration — Arsitektur (Implementasi di Tahap 2)

**Status sekarang (Tahap 1):** Menu dan panel AI sudah ada di UI tapi dalam
kondisi disabled/placeholder. Tidak ada logic AI yang diimplementasi.

**Arsitektur AI yang akan dipakai (Tahap 2):**

Semua provider AI mengimplementasi satu interface yang sama. Component lain hanya
berinteraksi dengan interface ini — tidak peduli provider mana yang aktif.

```ts
// src/features/ai/providers/index.ts
export type AIProviderType = 'claude' | 'openai' | 'gemini' | 'groq';

export interface AIProvider {
  name: string;
  generate: (prompt: string, systemPrompt?: string) => Promise<string>;
}

export const getAIProvider = (provider: AIProviderType): AIProvider => {
  switch (provider) {
    case 'claude':  return claudeProvider;
    case 'openai':  return openaiProvider;
    case 'gemini':  return geminiProvider;
    case 'groq':    return groqProvider;
    default:        throw new Error(`Provider tidak dikenal: ${provider}`);
  }
};
```

Setiap provider di file terpisah, struktur sama:
```ts
// src/features/ai/providers/claude.ts
import type { AIProvider } from './index';

export const claudeProvider: AIProvider = {
  name: 'Claude (Anthropic)',
  generate: async (prompt, systemPrompt) => {
    // implementasi fetch ke Anthropic API — diisi di Tahap 2
    throw new Error('Claude provider belum diimplementasi.');
  },
};
```

**PERINGATAN:** Untuk production, WAJIB gunakan backend proxy.
Jangan taruh API key di client-side — bisa dilihat semua orang via DevTools.

---

### 6. Zustand Store

```ts
// src/store/editorStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AIProviderType } from '@/features/ai/providers';

interface EditorStore {
  aiStatus: 'idle' | 'loading' | 'error' | 'success';
  aiLastResponse: string;
  setAiStatus: (status: EditorStore['aiStatus']) => void;
  setAiLastResponse: (content: string) => void;

  activeTheme: 'wedding' | 'minimal' | 'default';
  activeAIProvider: AIProviderType;
  setActiveTheme: (theme: EditorStore['activeTheme']) => void;
  setActiveAIProvider: (provider: AIProviderType) => void;

  isExportModalOpen: boolean;
  setExportModalOpen: (open: boolean) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
      aiStatus: 'idle',
      aiLastResponse: '',
      setAiStatus: (aiStatus) => set({ aiStatus }),
      setAiLastResponse: (aiLastResponse) => set({ aiLastResponse }),

      activeTheme: 'wedding',
      activeAIProvider: 'claude',
      setActiveTheme: (activeTheme) => set({ activeTheme }),
      setActiveAIProvider: (activeAIProvider) => set({ activeAIProvider }),

      isExportModalOpen: false,
      setExportModalOpen: (isExportModalOpen) => set({ isExportModalOpen }),
    }),
    {
      name: 'wedding-studio-preferences',
      partialize: (state) => ({
        activeTheme: state.activeTheme,
        activeAIProvider: state.activeAIProvider,
      }),
    }
  )
);
```

---

### 7. TypeScript — Strict Mode

- Tidak ada `any` yang explicit kecuali benar-benar tidak ada pilihan lain,
  dan harus diberi komentar alasannya
- Semua props React harus punya interface yang terdefinisi
- Semua fungsi async harus punya return type yang eksplisit
- Semua shared types disimpan di `src/types/index.ts`

---

### 8. Aturan Penambahan Library Baru

Sebelum menginstall library apapun yang belum ada di daftar di atas:

1. Cek apakah library masih aktif di npm (`last published` tidak lebih dari 1 tahun,
   kecuali ada alasan kuat seperti "sudah mature dan stabil")
2. Cek apakah ada alternatif yang lebih aktif di-maintain
3. Konfirmasi ke user terlebih dahulu sebelum install
4. Update tabel dependensi di dokumen ini setelah install

---

## Props GrapesEditor Component

```tsx
interface GrapesEditorProps {
  onSave?: (html: string, css: string) => void | Promise<void>;
  onLoad?: (editor: grapesjs.Editor) => void;
  theme?: 'wedding' | 'minimal' | 'default';
  initialHtml?: string;
  height?: string;           // Default: '100vh'. Contoh: 'calc(100vh - 64px)'
  showAIPanel?: boolean;     // Default: true — tampil tapi disabled di Tahap 1
  storageKey?: string;       // Key localStorage untuk autosave GrapesJS
}
```

---

## Cara Embed ke Project Lain

**Opsi A: Clone langsung (untuk project baru)**
```bash
git clone https://github.com/username/wedding-studio nama-project-baru
cd nama-project-baru
rm -rf .git
git init
npm install
```

**Opsi B: Copy folder src/ ke project yang sudah ada**
```bash
cp -r wedding-studio/src/. project-target/src/wedding-studio/

npm install grapesjs @grapesjs/react \
  grapesjs-blocks-basic grapesjs-plugin-forms \
  grapesjs-plugin-export grapesjs-style-bg \
  zustand sonner
```

**Penggunaan:**
```tsx
import { lazy, Suspense } from 'react';
import { Toaster } from 'sonner';

const GrapesEditor = lazy(() => import('./wedding-studio/editor/GrapesEditor'));

export default function EditorPage() {
  return (
    <>
      <Suspense fallback={<div>Memuat editor...</div>}>
        <GrapesEditor
          theme="wedding"
          height="calc(100vh - 64px)"
          storageKey="wedding-page-v1"
          onSave={async (html, css) => {
            await fetch('/api/pages', {
              method: 'POST',
              body: JSON.stringify({ html, css }),
            });
          }}
          showAIPanel={true}
        />
      </Suspense>
      <Toaster position="bottom-right" />
    </>
  );
}
```

---

## Plugin GrapesJS yang Aktif

| Plugin | Versi | Fungsi |
|--------|-------|--------|
| `grapesjs-blocks-basic` | 1.0.2 | Block dasar: text, image, video, link, map |
| `grapesjs-plugin-forms` | 2.0.6 | Input, textarea, select, button untuk RSVP |
| `grapesjs-plugin-export` | 1.0.12 | Export hasil sebagai ZIP (HTML + CSS) |
| `grapesjs-style-bg` | 2.0.2 | Background editor lebih lengkap |

Untuk menambah atau menonaktifkan plugin, edit `src/editor/plugins.ts`.

---

## Perintah Development

```bash
npm run dev          # Development server di http://localhost:5173
npm run build        # Build production ke folder dist/
npm run preview      # Preview hasil build secara lokal
npm run typecheck    # Cek TypeScript errors tanpa compile
```

---

## Hal yang JANGAN Dilakukan

- ❌ Import GrapesJS di level module — selalu gunakan `React.lazy()` + `Suspense`
- ❌ Set `overflow: hidden` pada parent langsung container editor
- ❌ Hardcode API key apapun di source code
- ❌ Install `@types/grapesjs` — tidak ada dan tidak perlu
- ❌ Install `@grapesjs/studio-sdk` — berbayar, tidak sesuai filosofi project ini
- ❌ Simpan instance editor GrapesJS di React state atau Zustand — gunakan `useRef`
- ❌ Panggil AI provider API langsung dari component — selalu lewat `src/features/ai/providers/index.ts`
- ❌ Implementasi logic AI di Tahap 1 — placeholder UI saja sudah cukup
- ❌ Install library baru tanpa verifikasi status maintenance-nya dan tanpa konfirmasi user
- ❌ Tambah abstraksi yang tidak perlu — kode harus mudah dibaca dan dimodifikasi
- ❌ Ubah struktur folder utama tanpa update CLAUDE.md ini

---

## Roadmap

### Tahap 1 — Editor Foundation (Sekarang)
- [ ] GrapesEditor component dengan CSS isolation yang solid
- [ ] Custom blocks wedding: Hero, Gallery, Countdown, RSVP, Map, Quote
- [ ] Theme presets: wedding, minimal
- [ ] Save ke localStorage (autosave)
- [ ] Export project sebagai `.json` (untuk diedit lagi)
- [ ] Import project dari file `.json`
- [ ] Export hasil sebagai ZIP (HTML + CSS siap publish)
- [ ] UI panel AI — tampil di sidebar tapi disabled/placeholder
- [ ] Toolbar: undo, redo, preview, save, export

### Tahap 2 — AI Integration (Setelah Tahap 1 selesai)
- [ ] Implementasi provider Claude (Anthropic)
- [ ] Implementasi provider OpenAI
- [ ] Implementasi provider Gemini
- [ ] Implementasi provider Groq
- [ ] AI generate teks: caption, vow, deskripsi venue
- [ ] AI generate full layout dari satu prompt
- [ ] Backend proxy untuk keamanan API key di production
- [ ] Pilihan provider AI dari UI

### Tahap 3 — Enhancement (Opsional)
- [ ] Template library wedding siap pakai
- [ ] Export ke PDF
- [ ] Multi-page support
- [ ] Integrasi image generation
- [ ] Autosave ke database
- [ ] Collaboration mode

---

*Update dokumen ini setiap kali ada perubahan arsitektur, penambahan dependensi baru,
atau perubahan konvensi kode yang signifikan. Selalu verifikasi versi library
sebelum mencantumkannya di sini.*
