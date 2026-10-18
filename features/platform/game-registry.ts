import type { BilingualText } from "@/features/platform/i18n/locale";

export type GameStatus = "available" | "coming-soon";

export type GameCatalogItem = {
  slug: string;
  title: BilingualText;
  description: BilingualText;
  mood: BilingualText;
  duration: BilingualText;
  symbol: string;
  status: GameStatus;
  href: string | null;
};

export const SNAKE_LADDER_SLUG = "ular-tangga"
export const COUPLE_QUIZ_SLUG = "seberapa-kenal";
export const MOST_LIKELY_SLUG = "siapa-yang-lebih";
export const PICK_ONE_SLUG = "pilih-mana";
export const LONGING_MAZE_SLUG = "labirin-rindu";
export const CRYPTOGRAM_CINTA_SLUG = "cryptogram-cinta";

export const CONNECTION_GAME_SLUGS = [
  PICK_ONE_SLUG,
] as const;

export type ConnectionGameSlug =
  (typeof CONNECTION_GAME_SLUGS)[number];

export function isConnectionGameSlug(
  value: string,
): value is ConnectionGameSlug {
  return CONNECTION_GAME_SLUGS.some(
    (slug) => slug === value,
  );
}

export const GAME_CATALOG: readonly GameCatalogItem[] = [
  {
    slug: SNAKE_LADDER_SLUG,
    title: {
      id: "Ular Tangga Cerita",
      en: "Story Snakes & Ladders",
    },
    description: {
      id: "Lempar dadu, buka petak cerita, dan capai garis akhir bersama.",
      en: "Roll the dice, open story prompts, and reach the finish together.",
    },
    mood: {
      id: "Santai & bercerita",
      en: "Relaxed & conversational",
    },
    duration: {
      id: "15–25 menit",
      en: "15–25 minutes",
    },
    symbol: "⚄",
    status: "available",
    href: "/games/ular-tangga",
  },
  {
    slug: COUPLE_QUIZ_SLUG,
    title: {
      id: "Seberapa Kenal Kamu?",
      en: "How Well Do You Know Each Other?",
    },
    description: {
      id: "Tebak pilihan pasangan, lalu buka jawabannya secara bersamaan.",
      en: "Predict your partner’s choice, then reveal both answers together.",
    },
    mood: {
      id: "Ringan & penuh kejutan",
      en: "Light & surprising",
    },
    duration: {
      id: "5–10 menit",
      en: "5–10 minutes",
    },
    symbol: "?",status: "available",
    href: "/games/seberapa-kenal",
  },
  {
    slug: MOST_LIKELY_SLUG,
    title: {
      id: "Siapa yang Lebih…?",
      en: "Who Is More Likely To…?",
    },
    description: {
      id: "Pilih secara rahasia siapa yang paling sesuai dengan setiap pertanyaan.",
      en: "Secretly choose who best fits each prompt, then compare your answers.",
    },
    mood: {
      id: "Cepat & jenaka",
      en: "Quick & playful",
    },
    duration: {
      id: "5 menit",
      en: "5 minutes",
    },
    symbol: "↔",
    status: "available",
    href: "/games/siapa-yang-lebih",
  },
  {
    slug: PICK_ONE_SLUG,
    title: {
      id: "Pilih Mana?",
      en: "Pick One",
    },
    description: {
      id: "Pilih satu dari dua kemungkinan secara rahasia, lalu bandingkan pilihan kalian.",
      en: "Choose between two options in private, then see where your choices align.",
    },
    mood: {
      id: "Cepat & reflektif",
      en: "Quick & reflective",
    },
    duration: {
      id: "5–10 menit",
      en: "5–10 minutes",
    },
    symbol: "◇",
    status: "available",
    href: "/games/pilih-mana",
  },
  {
    slug: LONGING_MAZE_SLUG,
    title: {
      id: "Labirin Rindu: Penjaga Hati",
      en: "Longing Maze: Heartkeepers",
    },
    description: {
      id: "Jelajahi labirin terpisah dan lindungi pasangan dari bahaya yang hanya dapat kamu lihat.",
      en: "Navigate separate mazes and protect your partner from dangers only you can see.",
    },
    mood: {
      id: "Kooperatif & strategis",
      en: "Cooperative & strategic",
    },
    duration: {
      id: "15–20 menit",
      en: "15–20 minutes",
    },
    symbol: "🛡️",
    status: "available",
    href: "/games/labirin-rindu",
  },
  {
    slug: CRYPTOGRAM_CINTA_SLUG,
    title: {
      id: "Cryptogram Cinta",
      en: "Love Cryptogram",
    },
    description: {
      id: "Pecahkan kutipan cinta bersama dan lanjutkan permainan saat sandi semakin sulit.",
      en: "Decode real quotations together and keep going as each cipher becomes harder.",
    },
    mood: {
      id: "Kooperatif & analitis",
      en: "Cooperative & analytical",
    },
    duration: {
      id: "10 menit–tanpa batas",
      en: "10 minutes–open ended",
    },
    symbol: "🔐",
    status: "available",
    href: "/games/cryptogram-cinta",
  },
];

export function isPlayableGameSlug(value: string) {
  return GAME_CATALOG.some(
    (game) => game.slug === value && game.status === "available",
  );
}
