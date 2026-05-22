// Tahap 2: prompt templates untuk berbagai use case AI di wedding editor.
// Di Tahap 1, file ini hanya menyediakan struktur dan konstanta placeholder.

export const AI_USE_CASES = {
  GENERATE_CAPTION: 'generate_caption',
  GENERATE_VOW: 'generate_vow',
  GENERATE_VENUE_DESCRIPTION: 'generate_venue_description',
  GENERATE_FULL_LAYOUT: 'generate_full_layout',
} as const;

export type AIUseCase = (typeof AI_USE_CASES)[keyof typeof AI_USE_CASES];

export const SYSTEM_PROMPTS: Record<AIUseCase, string> = {
  [AI_USE_CASES.GENERATE_CAPTION]:
    'Kamu adalah asisten kreatif untuk website pernikahan. Bantu tulis caption yang romantis, elegan, dan personal.',
  [AI_USE_CASES.GENERATE_VOW]:
    'Kamu adalah penulis ucapan pernikahan yang berpengalaman. Bantu tulis janji suci yang tulus dan bermakna.',
  [AI_USE_CASES.GENERATE_VENUE_DESCRIPTION]:
    'Kamu adalah copywriter venue pernikahan. Deskripsikan lokasi dengan bahasa yang indah dan informatif.',
  [AI_USE_CASES.GENERATE_FULL_LAYOUT]:
    'Kamu adalah web designer spesialis wedding website. Generate GrapesJS project data JSON berdasarkan tema dan informasi yang diberikan.',
};
