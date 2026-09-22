export type GameStatus = "available" | "coming-soon";

export type GameCatalogItem = {
  slug: string;
  title: string;
  description: string;
  mood: string;
  duration: string;
  symbol: string;
  status: GameStatus;
  href: string | null;
};

export const SNAKE_LADDER_SLUG = "ular-tangga"
export const COUPLE_QUIZ_SLUG = "seberapa-kenal";
export const MOST_LIKELY_SLUG = "siapa-yang-lebih";
export const PICK_ONE_SLUG = "pilih-mana";
export const LONGING_MAZE_SLUG = "labirin-rindu";

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
    title: "Ular Tangga Cerita",
    description:
      "Lempar dadu, temukan petak cerita, dan sampai ke garis akhir bersama.",
    mood: "Santai & bercerita",
    duration: "15–25 menit",
    symbol: "⚄",
    status: "available",
    href: "/games/ular-tangga",
  },
  {
    slug: COUPLE_QUIZ_SLUG,
    title: "Seberapa Kenal Kamu?",
    description:
      "Tebak jawaban pasanganmu lalu buka hasilnya secara bersamaan.",
    mood: "Seru & penasaran",
    duration: "5–10 menit",
    symbol: "?",status: "available",
    href: "/games/seberapa-kenal",
  },
  {
    slug: MOST_LIKELY_SLUG,
    title: "Siapa yang Lebih…?",
    description:
      "Pilih secara rahasia siapa yang paling cocok dengan setiap pertanyaan.",
    mood: "Cepat & jenaka",
    duration: "5 menit",
    symbol: "↔",
    status: "available",
    href: "/games/siapa-yang-lebih",
  },
  {
    slug: PICK_ONE_SLUG,
    title: "Pilih Mana?",
    description:
      "Pilih satu dari dua kemungkinan secara rahasia, lalu lihat seberapa sering hati kalian sejalan.",
    mood: "Cepat & mengejutkan",
    duration: "5–10 menit",
    symbol: "◇",
    status: "available",
    href: "/games/pilih-mana",
  },
  {
    slug: LONGING_MAZE_SLUG,
    title: "Labirin Rindu: Penjaga Hati",
    description:
      "RPG cinta terbalik: temukan skill dan lindungi pasangan dari bahaya yang hanya dapat kamu lihat.",
    mood: "RPG kooperatif & strategis",
    duration: "15–20 menit",
    symbol: "🛡️",
    status: "available",
    href: "/games/labirin-rindu",
  },
];

export function isPlayableGameSlug(value: string) {
  return GAME_CATALOG.some(
    (game) => game.slug === value && game.status === "available",
  );
}
