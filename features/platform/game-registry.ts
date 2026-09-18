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
];

export function isPlayableGameSlug(value: string) {
  return GAME_CATALOG.some(
    (game) => game.slug === value && game.status === "available",
  );
}