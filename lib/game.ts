export type PlayerRole = "host" | "guest";

export type GameHistoryItem = {
  at: string;
  role: PlayerRole | null;
  title: string;
  detail: string;
};

export type RoomView = {
  code: string;
  status: "waiting" | "active" | "finished";
  turn: PlayerRole;
  you: PlayerRole | null;
  players: {
    host: { name: string; position: number };
    guest: { name: string; position: number } | null;
  };
  winner: { role: PlayerRole; name: string } | null;
  lastRoll: number | null;
  challenge: string | null;
  challengeFor: PlayerRole | null;
  history: GameHistoryItem[];
  updatedAt: string;
};

export const LADDERS: Record<number, number> = {
  3: 18,
  8: 26,
  22: 39,
  31: 70,
  45: 66,
  61: 80,
  63: 85,
  75: 94,
};

export const SNAKES: Record<number, number> = {
  29: 11,
  44: 16,
  49: 32,
  58: 43,
  87: 47,
  92: 72,
  98: 81,
};

export const CHALLENGE_POSITIONS = [4, 6, 10, 12, 15, 19, 20, 23, 26, 27, 32, 35, 38, 39, 41, 42, 48, 51, 52, 57, 60, 64, 69, 71, 72, 76, 83, 85, 86, 89, 93, 96, 97];

export const CHALLENGES = [
  "Sebutkan satu hal kecil yang paling kamu rindukan dari dia.",
  "Kirim voice note 20 detik dengan cerita paling lucu hari ini.",
  "Tunjukkan benda terdekat yang mengingatkanmu pada pasangan.",
  "Pilih lagu yang paling cocok menggambarkan hubungan kalian minggu ini.",
  "Sebutkan satu date sederhana yang ingin kalian lakukan saat bertemu.",
  "Berikan pujian yang belum pernah kamu ucapkan sebelumnya.",
  "Ceritakan satu momen lama yang masih membuatmu tersenyum.",
  "Ambil foto ekspresi wajahmu sekarang dan kirim ke pasangan.",
  "Tebak camilan yang sedang paling diinginkan pasanganmu.",
  "Lengkapi kalimat: ‘Aku merasa paling dekat denganmu ketika…’",
  "Buat janji kecil yang bisa kalian tepati sebelum akhir minggu.",
  "Sebutkan tiga kata yang menggambarkan pasanganmu hari ini.",
    "Tirukan ekspresi pasangan saat sedang ngambek dan biarkan dia menilai kemiripannya.",
  "Buat pantun romantis dua baris dalam waktu 30 detik.",
  "Pilih satu foto bersama favoritmu lalu ceritakan alasan kamu menyukainya.",
  "Sebutkan satu kebiasaan lucu pasangan yang diam-diam kamu sukai.",
  "Main batu-gunting-kertas lewat video call; yang kalah harus memberikan gombalan spontan.",
  "Ceritakan kesan pertamamu saat pertama kali mengenal pasangan.",
  "Buat nama panggilan baru untuk pasangan dan jelaskan artinya.",
  "Tatap pasangan selama 10 detik tanpa tertawa; yang tertawa lebih dahulu harus bernyanyi.",
  "Peragakan pose foto yang ingin kalian lakukan saat bertemu nanti.",
  "Tebak jawaban pasangan: jika bisa pergi sekarang, kota mana yang ingin dia kunjungi bersamamu?",
  "Rancang menu makan malam impian kalian, mulai dari makanan hingga pencuci mulut.",
  "Buat judul film yang menggambarkan kisah hubungan kalian.",
  "Sebutkan satu hal baru yang ingin kamu coba bersama pasangan tahun ini.",
  "Kirim lima emoji yang menggambarkan hubungan kalian dan biarkan pasangan menebak artinya.",
  "Ucapkan terima kasih atas satu hal sederhana yang dilakukan pasangan belakangan ini.",
    "Gambarkan pasanganmu sebagai cuaca hari ini dan jelaskan alasannya.",
  "Pilih satu kekuatan super yang paling berguna untuk hubungan kalian.",
  "Gambar wajah pasangan dalam waktu 60 detik lalu tunjukkan hasilnya.",
  "Bersenandunglah tanpa lirik dan minta pasangan menebak lagunya.",
  "Jawab cepat tanpa berpikir: pagi atau malam, pantai atau gunung, telepon atau chat?",
  "Baca kembali pesan pertama kalian lalu ceritakan perasaanmu saat membacanya sekarang.",
  "Tebak suasana hati pasangan menggunakan tiga emoji saja.",
  "Sebutkan lima hal tentang pasangan dalam waktu sepuluh detik.",
  "Ciptakan nama kafe imajiner milik kalian beserta satu menu andalannya.",
  "Berikan pujian tanpa menggunakan kata cantik, ganteng, baik, atau sayang.",
  "Peragakan kembali momen pertama kali kalian menelepon atau bertemu.",
  "Cari benda dengan warna favorit pasangan dalam waktu 20 detik.",
  "Pilih pasangan karakter film yang paling mirip dengan hubungan kalian.",
  "Ceritakan satu hal kecil tentang dirimu yang mungkin belum diketahui pasangan.",
  "Susun tiga kegiatan untuk bucket list jarak jauh kalian.",
  "Minta pasangan memberikan satu kata acak, lalu buat cerita romantis menggunakan kata itu.",
  "Ucapkan kalimat sulit tiga kali dengan cepat sambil menyebut nama pasangan.",
  "Tebak hadiah mana yang akan dipilih pasangan: bunga, makanan, atau perjalanan kejutan.",
  "Ciptakan salam rahasia yang akan kalian lakukan saat bertemu nanti.",
  "Gambarkan akhir pekan sempurna bersama pasangan dalam tepat lima kalimat.",
  "Tirukan emoji atau stiker yang paling sering dikirim pasangan.",
  "Pilih satu lagu untuk diputar bersamaan selama satu menit.",
  "Sebutkan sifat terkuat pasangan dan berikan satu contoh nyatanya.",
  "Berlomba menemukan benda paling aneh di sekitar kalian dalam waktu 30 detik.",
  "Minta pasangan memberikan tiga kata acak, lalu buat kisah cinta singkat dari ketiganya.",
  "Jika bisa mengulang satu hari bersama pasangan, hari apa yang akan kamu pilih?",
  "Ajukan satu pertanyaan yang selama ini belum pernah kamu tanyakan kepada pasangan.",
  "Buat iklan berdurasi sepuluh detik yang mempromosikan betapa kerennya pasanganmu.",
  "Urutkan tiga ide kencan berikut dari favoritmu: piknik, memasak bersama, atau perjalanan spontan.",
  "Tutup mata lalu sebutkan lima detail wajah pasangan yang paling kamu ingat.",
];

const rows = Array.from({ length: 10 }, (_, row) => {
  const start = row * 10 + 1;
  const values = Array.from({ length: 10 }, (_, index) => start + index);
  return row % 2 === 0 ? values : values.reverse();
});

export const BOARD_CELLS = rows.reverse().flat();

export function resolveMove(position: number, roll: number) {
  const attempted = position + roll;
  if (attempted > 100) {
    return { position, attempted, transition: null as "ladder" | "snake" | null, exactRequired: true };
  }
  if (LADDERS[attempted]) {
    return { position: LADDERS[attempted], attempted, transition: "ladder" as const, exactRequired: false };
  }
  if (SNAKES[attempted]) {
    return { position: SNAKES[attempted], attempted, transition: "snake" as const, exactRequired: false };
  }
  return { position: attempted, attempted, transition: null, exactRequired: false };
}
