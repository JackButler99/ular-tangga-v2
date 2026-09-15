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

export const GAME_CATALOG: readonly GameCatalogItem[] = [
  {
    slug: "ular-tangga",
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
    slug: "seberapa-kenal",
    title: "Seberapa Kenal Kamu?",
    description:
      "Tebak jawaban pasanganmu lalu buka hasilnya secara bersamaan.",
    mood: "Seru & penasaran",
    duration: "5–10 menit",
    symbol: "?",
    status: "coming-soon",
    href: null,
  },
  {
    slug: "siapa-yang-lebih",
    title: "Siapa yang Lebih…?",
    description:
      "Pilih secara rahasia siapa yang paling cocok dengan setiap pertanyaan.",
    mood: "Cepat & jenaka",
    duration: "5 menit",
    symbol: "↔",
    status: "coming-soon",
    href: null,
  },
];