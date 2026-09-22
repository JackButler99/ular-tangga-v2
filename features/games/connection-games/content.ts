export type PickOneAnswer = "a" | "b";

export type PickOneChapter =
  | "pemanasan"
  | "koneksi"
  | "lebih-dalam";

export type PickOneOption = {
  id: PickOneAnswer;
  emoji: string;
  label: string;
};

export type PickOneRound = {
  id: string;
  category: string;
  chapter: PickOneChapter;
  prompt: string;
  options: readonly [PickOneOption, PickOneOption];
  reflection: string;
};

type PickOneSeed = readonly [
  id: string,
  category: string,
  prompt: string,
  firstEmoji: string,
  firstLabel: string,
  secondEmoji: string,
  secondLabel: string,
  reflection: string,
];

const PICK_ONE_SEEDS = [
  ["quiet-or-adventure", "Date", "Kalau akhir pekan ini benar-benar kosong, kalian lebih ingin…", "☕", "Menikmati hari pelan tanpa banyak rencana", "🗺️", "Pergi spontan mencari pengalaman baru", "Apa yang membuat pilihan itu terasa paling kalian butuhkan sekarang?"],
  ["message-or-call", "Komunikasi", "Saat sedang sangat rindu, mana yang terasa lebih dekat?", "💬", "Pesan panjang yang bisa dibaca berulang kali", "📞", "Telepon singkat tetapi mendengar suaranya", "Ceritakan satu hal kecil yang paling ampuh meredakan rindu kalian."],
  ["planned-or-surprise", "Romantis", "Kejutan romantis yang lebih menggoda adalah…", "🗓️", "Kencan yang direncanakan dengan sangat matang", "🎁", "Ajakan spontan tanpa tahu tujuan akhirnya", "Bagian kejutan seperti apa yang tetap membuat kalian merasa nyaman?"],
  ["cook-or-hunt", "Kuliner", "Untuk makan malam berdua, kalian memilih…", "🍳", "Memasak resep baru sebagai satu tim", "🍜", "Berburu makanan enak di luar", "Menu apa yang harus masuk daftar date night kalian berikutnya?"],
  ["photos-or-present", "Kenangan", "Saat mengalami momen indah, kalian lebih memilih…", "📷", "Mengabadikannya lewat banyak foto", "✨", "Menyimpan ponsel dan hadir sepenuhnya", "Momen apa yang tetap kalian ingat jelas meski tidak banyak difoto?"],
  ["same-hobby-or-own-space", "Keseharian", "Waktu luang berdua terasa paling sehat ketika…", "🎮", "Kalian menekuni satu hobi yang sama", "🌿", "Kalian melakukan hobi masing-masing tetapi tetap berdekatan", "Aktivitas apa yang ingin kalian coba bersama, dan apa yang ingin tetap menjadi ruang pribadi?"],
  ["sunrise-or-midnight", "Suasana", "Momen romantis yang lebih kalian pilih adalah…", "🌅", "Mengejar matahari terbit bersama", "🌙", "Mengobrol lewat tengah malam", "Kapan kalian biasanya paling mudah berbicara dari hati ke hati?"],
  ["repeat-or-new-place", "Date", "Untuk kencan berikutnya, kalian lebih tertarik…", "🏡", "Kembali ke tempat favorit yang penuh kenangan", "🚪", "Mencoba tempat yang sama sekali baru", "Tempat mana yang pantas menjadi tempat khas hubungan kalian?"],
  ["gift-or-experience", "Perhatian", "Untuk merayakan pencapaian pasangan, mana yang lebih bermakna?", "🎀", "Hadiah personal yang bisa disimpan", "🎟️", "Pengalaman seru yang dinikmati bersama", "Apa hadiah atau pengalaman kecil yang masih kalian ingat sampai sekarang?"],
  ["talk-now-or-cool-down", "Komunikasi", "Ketika mulai berbeda pendapat, kalian lebih nyaman…", "🫶", "Membicarakannya selagi masih terasa jelas", "🌬️", "Mengambil jeda lalu kembali dengan kepala dingin", "Berapa lama jeda yang terasa menenangkan tanpa membuat salah satu merasa ditinggalkan?"],
  ["city-or-nature", "Liburan", "Jika besok mendapat tiket gratis, kalian menuju…", "🌆", "Kota ramai dengan banyak makanan dan kegiatan", "🏞️", "Tempat tenang dekat alam", "Apa satu destinasi yang ingin kalian tandai di peta bersama?"],
  ["movie-or-game", "Hiburan", "Malam santai di rumah lebih seru dengan…", "🍿", "Film pilihan dan camilan lengkap", "🎲", "Game yang membuat kalian saling menantang", "Judul film atau game apa yang harus masuk agenda malam berikutnya?"],
  ["little-daily-or-big-moment", "Romantis", "Hubungan terasa paling romantis melalui…", "🌱", "Perhatian kecil yang hadir setiap hari", "🎆", "Momen besar yang disiapkan secara spesial", "Perhatian kecil apa yang ingin lebih sering kalian lakukan?"],
  ["shared-calendar-or-spontaneous", "Keseharian", "Cara terbaik menjaga waktu berdua adalah…", "📅", "Menjadwalkannya agar benar-benar terlindungi", "⚡", "Memanfaatkan momen spontan ketika sama-sama sempat", "Kapan waktu realistis yang bisa kalian lindungi khusus untuk berdua?"],
  ["voice-note-or-photo", "LDR", "Untuk ikut hadir di hari pasangan dari jauh, kalian memilih…", "🎙️", "Voice note yang menceritakan suasana hari", "📸", "Foto spontan dari hal-hal kecil yang dilihat", "Bagian kecil dari harimu apa yang paling ingin pasanganmu lihat atau dengar?"],
  ["future-home-or-world-trip", "Masa depan", "Mimpi bersama yang ingin lebih dulu diwujudkan adalah…", "🏠", "Menciptakan tempat yang terasa seperti rumah", "✈️", "Menjelajahi banyak tempat bersama", "Langkah kecil apa yang bisa mulai dilakukan untuk mimpi itu?"],
  ["compliment-or-help", "Perhatian", "Setelah hari yang berat, mana yang lebih menguatkan?", "💌", "Mendengar kata-kata yang tulus dan spesifik", "🤝", "Menerima bantuan nyata tanpa perlu banyak bicara", "Kalimat atau bantuan seperti apa yang paling dibutuhkan belakangan ini?"],
  ["double-date-or-private", "Sosial", "Untuk mengisi Sabtu malam, kalian lebih memilih…", "🥳", "Double date atau berkumpul bersama teman", "🕯️", "Waktu privat hanya untuk kalian berdua", "Apa yang membuat waktu sosial dan waktu privat terasa seimbang?"],
  ["letters-or-playlist", "Kenangan", "Kapsul waktu hubungan kalian lebih menarik jika berisi…", "✉️", "Surat untuk dibaca beberapa tahun lagi", "🎵", "Playlist yang merekam setiap fase hubungan", "Apa satu pesan atau lagu yang pasti harus masuk ke dalamnya?"],
  ["learn-or-relax", "Quality time", "Proyek satu bulan berdua yang lebih menyenangkan adalah…", "🧩", "Belajar keterampilan baru bersama", "🛋️", "Membuat ritual santai yang konsisten", "Keterampilan atau ritual apa yang paling mungkin kalian pertahankan?"],
  ["sweet-or-silly", "Romantis", "Pesan kejutan di tengah hari lebih kalian sukai jika…", "🥰", "Manis dan membuat hati hangat", "😂", "Konyol dan membuat tertawa sendiri", "Kirimkan satu contoh pesan itu setelah permainan selesai."],
  ["revisit-first-or-preview-future", "Cerita kalian", "Jika bisa membuka satu pintu ajaib, kalian memilih…", "🕰️", "Mengulang satu hari favorit dari masa lalu", "🔭", "Mengintip satu hari bahagia di masa depan", "Hari mana yang ingin diulang, atau masa depan seperti apa yang ingin dilihat?"],
  ["one-long-date-or-mini-dates", "Date", "Dalam satu bulan yang sibuk, kalian lebih memilih…", "🌹", "Satu kencan panjang yang benar-benar spesial", "✨", "Beberapa mini date yang sederhana", "Mini date berdurasi tiga puluh menit seperti apa yang realistis untuk kalian?"],
  ["map-or-no-plan", "Petualangan", "Saat bepergian bersama, kalian lebih menikmati…", "🧭", "Rute yang sudah disusun agar semuanya sempat dicoba", "🚶", "Berjalan tanpa agenda dan mengikuti rasa penasaran", "Siapa yang biasanya menjadi perencana dan siapa yang menjaga spontanitas?"],
] as const satisfies readonly PickOneSeed[];

function chapterForCategory(
  category: string,
): PickOneChapter {
  if (
    [
      "Kuliner",
      "Hiburan",
      "Suasana",
      "Petualangan",
      "Sosial",
      "Liburan",
    ].includes(category)
  ) {
    return "pemanasan";
  }

  if (
    [
      "Date",
      "Quality time",
      "Keseharian",
      "Perhatian",
      "LDR",
    ].includes(category)
  ) {
    return "koneksi";
  }

  return "lebih-dalam";
}

export const PICK_ONE_ROUNDS: readonly PickOneRound[] =
  PICK_ONE_SEEDS.map(
    ([
      id,
      category,
      prompt,
      firstEmoji,
      firstLabel,
      secondEmoji,
      secondLabel,
      reflection,
    ]) => ({
      id,
      category,
      chapter: chapterForCategory(category),
      prompt,
      options: [
        {
          id: "a",
          emoji: firstEmoji,
          label: firstLabel,
        },
        {
          id: "b",
          emoji: secondEmoji,
          label: secondLabel,
        },
      ],
      reflection,
    }),
  );

const ROUND_BY_ID = new Map(
  PICK_ONE_ROUNDS.map((round) => [round.id, round]),
);

export function getPickOneRound(id: string) {
  const round = ROUND_BY_ID.get(id);

  if (!round) {
    throw new Error(`Ronde "${id}" tidak ditemukan.`);
  }

  return round;
}
