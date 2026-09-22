export type MazeMomentPrompt = {
  id: string;
  emoji: string;
  title: string;
  prompt: string;
};

export const MAZE_MOMENT_PROMPTS: readonly MazeMomentPrompt[] = [
  {
    id: "small-close",
    emoji: "🤏",
    title: "Hal kecil, rasa besar",
    prompt:
      "Sebutkan satu hal kecil yang dilakukan pasanganmu belakangan ini dan diam-diam membuatmu merasa dekat.",
  },
  {
    id: "instant-date",
    emoji: "⚡",
    title: "Date kilat",
    prompt:
      "Kalian punya waktu satu jam malam ini. Sepakati satu mini date yang benar-benar mungkin dilakukan.",
  },
  {
    id: "comfort-code",
    emoji: "🫶",
    title: "Kode nyaman",
    prompt:
      "Lengkapi bersama: ketika hariku berat, cara termudah membuatku merasa ditemani adalah…",
  },
  {
    id: "favorite-us",
    emoji: "📸",
    title: "Potret favorit",
    prompt:
      "Pilih satu kenangan sederhana tentang kalian yang ingin diputar ulang selama lima menit.",
  },
  {
    id: "future-morning",
    emoji: "🌅",
    title: "Suatu pagi nanti",
    prompt:
      "Bayangkan satu pagi bahagia di masa depan. Di mana kalian berada dan apa hal pertama yang dilakukan?",
  },
  {
    id: "secret-skill",
    emoji: "✨",
    title: "Kekuatan rahasia",
    prompt:
      "Sebutkan satu kualitas pasanganmu yang menurutmu belum cukup ia banggakan.",
  },
  {
    id: "laugh-again",
    emoji: "😂",
    title: "Tertawa lagi",
    prompt:
      "Ceritakan satu kejadian tentang kalian yang masih bisa membuatmu tertawa ketika mengingatnya.",
  },
  {
    id: "safe-place",
    emoji: "🏡",
    title: "Tempat pulang",
    prompt:
      "Apa yang dilakukan pasanganmu sehingga hubungan ini terasa seperti tempat pulang?",
  },
  {
    id: "tiny-promise",
    emoji: "🤝",
    title: "Janji kecil",
    prompt:
      "Buat satu janji kecil yang realistis untuk dilakukan kepada satu sama lain dalam tujuh hari ke depan.",
  },
  {
    id: "song-scene",
    emoji: "🎵",
    title: "Lagu adegan ini",
    prompt:
      "Jika perjalanan kalian malam ini menjadi adegan film, lagu apa yang cocok menjadi musik latarnya?",
  },
  {
    id: "thank-you",
    emoji: "💌",
    title: "Terima kasih",
    prompt:
      "Ucapkan terima kasih untuk satu hal spesifik yang biasanya terlihat sepele.",
  },
  {
    id: "dream-team",
    emoji: "🧩",
    title: "Tim impian",
    prompt:
      "Dalam situasi apa kalian merasa paling kompak sebagai sebuah tim?",
  },
  {
    id: "next-photo",
    emoji: "🖼️",
    title: "Foto berikutnya",
    prompt:
      "Bayangkan foto kalian berikutnya yang pantas dicetak. Foto itu diambil di mana?",
  },
  {
    id: "three-words",
    emoji: "💬",
    title: "Tiga kata",
    prompt:
      "Pilih tiga kata untuk menggambarkan hubungan kalian saat ini, lalu jelaskan kata yang paling penting.",
  },
  {
    id: "new-ritual",
    emoji: "🕯️",
    title: "Ritual baru",
    prompt:
      "Ciptakan satu ritual berdua berdurasi kurang dari sepuluh menit yang ingin kalian coba.",
  },
  {
    id: "miss-most",
    emoji: "🌙",
    title: "Yang paling dirindukan",
    prompt:
      "Ketika sedang berjauhan, hal kecil apa dari pasanganmu yang paling cepat kamu rindukan?",
  },
  {
    id: "brave-together",
    emoji: "🗺️",
    title: "Berani bersama",
    prompt:
      "Apa satu hal baru yang terasa lebih berani untuk dicoba karena kalian melakukannya bersama?",
  },
  {
    id: "listen-better",
    emoji: "👂",
    title: "Dengarkan ini",
    prompt:
      "Sebutkan satu topik yang ingin kamu ceritakan lebih banyak kepada pasanganmu minggu ini.",
  },
  {
    id: "ideal-silence",
    emoji: "☁️",
    title: "Diam yang nyaman",
    prompt:
      "Aktivitas apa yang tetap terasa intim meskipun kalian hampir tidak berbicara?",
  },
  {
    id: "one-wish",
    emoji: "🌠",
    title: "Satu harapan",
    prompt:
      "Sampaikan satu harapan sederhana untuk hubungan kalian dalam tiga bulan ke depan.",
  },
] as const;

const MOMENT_BY_ID = new Map(
  MAZE_MOMENT_PROMPTS.map((moment) => [moment.id, moment]),
);

export function getMazeMomentPrompt(id: string) {
  const prompt = MOMENT_BY_ID.get(id);

  if (!prompt) {
    throw new Error(`Momen labirin "${id}" tidak ditemukan.`);
  }

  return prompt;
}
