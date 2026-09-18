export type QuizQuestionCategory =
  | "ringan"
  | "kebiasaan"
  | "romantis"
  | "kencan"
  | "ldr"
  | "kenangan"
  | "masa-depan"
  | "mendalam";

export type QuizQuestion = {
  id: string;
  category: QuizQuestionCategory;
  prompt: string;
  options: readonly string[];
};

type QuizQuestionSeed = readonly [
  id: string,
  category: QuizQuestionCategory,
  prompt: string,
  options: readonly string[],
];

const QUIZ_QUESTION_BANK = [
  ["free-evening", "ringan", "Kalau punya malam kosong, apa yang paling ingin dia lakukan?", ["Menonton film", "Mencari makanan", "Tidur lebih awal", "Mengobrol berdua"]],
  ["comfort-food", "ringan", "Makanan apa yang paling mungkin dia cari saat sedang sedih?", ["Makanan pedas", "Makanan manis", "Sup atau mi hangat", "Makanan rumah"]],
  ["morning-drink", "ringan", "Minuman apa yang paling dia inginkan pada pagi hari?", ["Kopi", "Teh", "Susu atau cokelat", "Air putih saja"]],
  ["movie-genre", "ringan", "Genre film apa yang paling mungkin dia pilih?", ["Komedi", "Romantis", "Horor", "Aksi atau misteri"]],
  ["rainy-day", "ringan", "Apa pilihan dia saat hujan turun sepanjang hari?", ["Tidur", "Menonton", "Makan hangat", "Tetap pergi keluar"]],
  ["weekend", "ringan", "Akhir pekan ideal menurut dia seperti apa?", ["Istirahat di rumah", "Wisata kuliner", "Bertemu teman", "Pergi ke tempat baru"]],
  ["late-night-snack", "ringan", "Camilan tengah malam apa yang paling mungkin dia pilih?", ["Mi instan", "Roti atau kue", "Camilan asin", "Tidak makan malam-malam"]],
  ["music-mood", "ringan", "Musik seperti apa yang paling sering dia dengarkan?", ["Lagu romantis", "Lagu ceria", "Lagu galau", "Musik instrumental"]],
  ["holiday-destination", "ringan", "Destinasi liburan mana yang paling dia pilih?", ["Pantai", "Pegunungan", "Kota besar", "Desa yang tenang"]],
  ["social-setting", "ringan", "Di acara ramai, dia biasanya menjadi orang yang seperti apa?", ["Pusat perhatian", "Mengobrol dengan beberapa orang", "Menempel pada orang terdekat", "Ingin cepat pulang"]],
  ["phone-break", "ringan", "Kalau harus sehari tanpa ponsel, apa yang paling mungkin dia lakukan?", ["Tidur lebih lama", "Membaca atau menonton", "Keluar rumah", "Mencarimu"]],
  ["weather-choice", "ringan", "Cuaca seperti apa yang paling dia sukai?", ["Cerah dan hangat", "Mendung", "Hujan", "Dingin"]],
  ["favorite-dessert", "ringan", "Hidangan penutup mana yang paling mungkin dia pilih?", ["Es krim", "Kue cokelat", "Buah", "Tidak terlalu suka makanan manis"]],
  ["pet-choice", "ringan", "Hewan peliharaan mana yang paling dia inginkan?", ["Kucing", "Anjing", "Ikan atau burung", "Tidak ingin memelihara hewan"]],
  ["shopping-style", "ringan", "Bagaimana gaya dia saat berbelanja?", ["Membuat daftar", "Membandingkan lama", "Membeli spontan", "Cepat mengambil keputusan"]],

  ["chat-style", "kebiasaan", "Bagaimana gaya dia saat berkirim pesan?", ["Pesan pendek dan cepat", "Pesan panjang", "Banyak emoji atau stiker", "Lebih suka telepon"]],
  ["under-stress", "kebiasaan", "Apa yang biasanya dia butuhkan ketika sedang stres?", ["Didengarkan", "Diberi ruang", "Dihibur", "Dibantu mencari solusi"]],
  ["decision-style", "kebiasaan", "Bagaimana biasanya dia mengambil keputusan penting?", ["Mengikuti perasaan", "Membuat pertimbangan", "Meminta pendapat", "Memutuskan spontan"]],
  ["sleep-routine", "kebiasaan", "Apa kebiasaan terakhirnya sebelum tidur?", ["Melihat ponsel", "Mendengarkan musik", "Mengobrol", "Langsung tidur"]],
  ["wake-style", "kebiasaan", "Bagaimana dia biasanya bangun pada pagi hari?", ["Langsung bangun", "Menunda alarm", "Mengecek ponsel", "Butuh dibangunkan"]],
  ["punctuality", "kebiasaan", "Saat punya janji, kapan biasanya dia datang?", ["Jauh lebih awal", "Tepat waktu", "Sedikit terlambat", "Tergantung situasi"]],
  ["trip-planning", "kebiasaan", "Bagaimana dia mempersiapkan perjalanan?", ["Membuat itinerary lengkap", "Hanya memesan yang penting", "Mengikuti rencana orang lain", "Pergi secara spontan"]],
  ["room-tidiness", "kebiasaan", "Bagaimana kondisi ruang pribadinya biasanya?", ["Sangat rapi", "Cukup rapi", "Berantakan tetapi tahu letaknya", "Berubah-ubah"]],
  ["break-time", "kebiasaan", "Apa yang dia lakukan saat mengambil istirahat singkat?", ["Membuka media sosial", "Mencari makanan", "Berjalan sebentar", "Menghubungimu"]],
  ["when-angry", "kebiasaan", "Apa respons pertamanya ketika sedang kesal?", ["Diam dahulu", "Langsung membicarakan", "Menulis pesan panjang", "Mencari pengalihan"]],
  ["when-sick", "kebiasaan", "Ketika sedang sakit, dia paling ingin diperlakukan bagaimana?", ["Ditemani terus", "Dibawakan makanan", "Diingatkan minum obat", "Dibiarkan banyak beristirahat"]],
  ["recharge-energy", "kebiasaan", "Bagaimana cara terbaiknya mengisi kembali energi?", ["Sendirian", "Bersamamu", "Bersama teman", "Melakukan hobi"]],
  ["solve-problem", "kebiasaan", "Ketika ada masalah, apa yang biasanya dia lakukan pertama kali?", ["Menganalisis sendiri", "Menceritakan kepadamu", "Meminta saran orang lain", "Menunggu sampai lebih tenang"]],
  ["good-news", "kebiasaan", "Ketika mendapat kabar baik, siapa yang paling ingin dia hubungi dahulu?", ["Pasangan", "Keluarga", "Sahabat", "Tidak langsung memberi tahu"]],
  ["couple-photo", "kebiasaan", "Bagaimana perasaannya tentang foto berdua?", ["Sangat suka", "Suka jika spontan", "Hanya pada momen khusus", "Lebih suka menikmati momen"]],

  ["love-language", "romantis", "Perhatian seperti apa yang paling membuatnya merasa dicintai?", ["Kata-kata manis", "Waktu berdua", "Hadiah kecil", "Bantuan nyata"]],
  ["favorite-gift", "romantis", "Hadiah seperti apa yang paling membuatnya senang?", ["Barang berguna", "Barang personal", "Makanan favorit", "Pengalaman bersama"]],
  ["ideal-affection", "romantis", "Bentuk kasih sayang mana yang paling dia sukai?", ["Pelukan", "Genggaman tangan", "Pesan perhatian", "Tindakan membantu"]],
  ["favorite-compliment", "romantis", "Pujian apa yang paling ingin dia dengar?", ["Tentang penampilan", "Tentang kepribadian", "Tentang kemampuan", "Tentang usahanya"]],
  ["meaningful-apology", "romantis", "Permintaan maaf seperti apa yang paling berarti baginya?", ["Kata-kata tulus", "Pelukan", "Perubahan tindakan", "Waktu untuk menenangkan diri"]],
  ["romantic-surprise", "romantis", "Kejutan seperti apa yang paling dia sukai?", ["Makanan mendadak", "Hadiah personal", "Kunjungan tiba-tiba", "Rencana perjalanan"]],
  ["when-missing", "romantis", "Ketika sangat merindukanmu, apa yang paling mungkin dia lakukan?", ["Mengirim pesan", "Mengajak telepon", "Melihat foto lama", "Menunggu kamu menghubungi"]],
  ["romantic-message", "romantis", "Pesan romantis seperti apa yang paling dia sukai?", ["Singkat tetapi rutin", "Panjang dan mendalam", "Lucu dan menggoda", "Spontan tanpa alasan"]],
  ["public-affection", "romantis", "Bagaimana perasaannya tentang menunjukkan kasih sayang di depan umum?", ["Sangat nyaman", "Nyaman secukupnya", "Hanya jika sepi", "Lebih suka secara pribadi"]],
  ["support-style", "romantis", "Saat dia mengalami hari buruk, dukungan apa yang paling berarti?", ["Didengarkan", "Dipeluk", "Diberi solusi", "Diajak melakukan hal menyenangkan"]],
  ["anniversary-style", "romantis", "Bagaimana dia ingin merayakan anniversary?", ["Makan malam romantis", "Pergi berdua", "Bertukar hadiah", "Menghabiskan waktu sederhana"]],
  ["reassurance", "romantis", "Apa yang paling membuatnya merasa tenang dalam hubungan?", ["Kabar yang konsisten", "Kata-kata meyakinkan", "Rencana yang jelas", "Kehadiran saat dibutuhkan"]],
  ["after-conflict", "romantis", "Setelah berselisih, apa yang paling dia inginkan?", ["Segera berdamai", "Waktu untuk tenang", "Pembicaraan mendalam", "Pelukan tanpa banyak kata"]],
  ["small-gesture", "romantis", "Perhatian kecil mana yang paling membuatnya tersenyum?", ["Pesan selamat pagi", "Makanan favorit", "Mengingat cerita kecil", "Pujian tiba-tiba"]],
  ["relationship-song", "romantis", "Lagu hubungan seperti apa yang paling mungkin dia pilih untuk kalian?", ["Manis dan ceria", "Tenang dan hangat", "Dramatis dan mendalam", "Lucu dan penuh kenangan"]],

  ["ideal-date", "kencan", "Kencan seperti apa yang paling dia sukai?", ["Makan malam tenang", "Petualangan di luar", "Menonton bersama", "Jalan tanpa rencana"]],
  ["spontaneous-date", "kencan", "Jika dia mengajak kencan mendadak, ke mana kemungkinan kalian pergi?", ["Tempat makan", "Taman atau ruang terbuka", "Bioskop", "Berkendara tanpa tujuan"]],
  ["budget-date", "kencan", "Kencan hemat mana yang paling dia nikmati?", ["Piknik", "Memasak bersama", "Jalan sore", "Menonton di rumah"]],
  ["special-date", "kencan", "Untuk momen khusus, pengalaman mana yang paling dia pilih?", ["Restoran istimewa", "Staycation", "Konser atau acara", "Perjalanan singkat"]],
  ["home-date", "kencan", "Aktivitas kencan di rumah mana yang paling dia sukai?", ["Memasak", "Maraton film", "Bermain game", "Mengobrol sambil mendengarkan musik"]],
  ["food-date", "kencan", "Kencan kuliner seperti apa yang paling menarik baginya?", ["Mencoba restoran baru", "Street food", "Kafe dan makanan manis", "Memasak resep baru"]],
  ["outdoor-date", "kencan", "Kencan luar ruangan mana yang paling dia pilih?", ["Pantai", "Pegunungan", "Taman kota", "Pasar malam"]],
  ["creative-date", "kencan", "Aktivitas kreatif mana yang paling ingin dia coba bersamamu?", ["Melukis", "Membuat keramik", "Memotret", "Membuat scrapbook"]],
  ["short-date", "kencan", "Jika hanya punya satu jam bersama, apa yang paling ingin dia lakukan?", ["Minum kopi", "Makan cepat", "Jalan sambil mengobrol", "Duduk berdua tanpa gangguan"]],
  ["dream-date", "kencan", "Kencan impian mana yang paling mendekati keinginannya?", ["Dinner dengan pemandangan", "Perjalanan kejutan", "Konser favorit", "Malam sederhana penuh percakapan"]],

  ["ldr-call", "ldr", "Saat LDR, bentuk komunikasi mana yang paling dia sukai?", ["Video call", "Telepon suara", "Chat sepanjang hari", "Pesan panjang pada malam hari"]],
  ["ldr-missing", "ldr", "Apa yang paling membantunya saat sedang rindu dalam LDR?", ["Melihat wajahmu", "Mendengar suaramu", "Membaca pesan lama", "Merencanakan pertemuan"]],
  ["ldr-routine", "ldr", "Rutinitas LDR mana yang paling ingin dia miliki?", ["Telepon sebelum tidur", "Pesan pagi", "Date online mingguan", "Berbagi foto aktivitas"]],
  ["ldr-surprise", "ldr", "Kejutan LDR mana yang paling membuatnya bahagia?", ["Kiriman makanan", "Surat atau paket", "Video khusus", "Kunjungan mendadak"]],
  ["ldr-conflict", "ldr", "Ketika salah paham saat LDR, apa yang paling dia pilih?", ["Langsung menelepon", "Menulis penjelasan", "Tenang dahulu", "Menjadwalkan waktu bicara"]],
  ["ldr-quality-time", "ldr", "Aktivitas online mana yang paling dia nikmati bersamamu?", ["Menonton bersama", "Bermain game", "Makan bersama lewat video", "Deep talk"]],
  ["ldr-schedule", "ldr", "Jika jadwal kalian berbeda, apa solusi yang paling dia sukai?", ["Menetapkan waktu rutin", "Mengirim voice note", "Chat saat sempat", "Membuat jadwal mingguan"]],
  ["ldr-package", "ldr", "Isi paket LDR mana yang paling ingin dia terima?", ["Makanan favorit", "Barang yang beraroma dirimu", "Surat tulisan tangan", "Album foto kecil"]],
  ["ldr-reunion", "ldr", "Hal pertama apa yang paling ingin dia lakukan saat kalian bertemu lagi?", ["Memelukmu", "Makan bersama", "Pergi ke tempat favorit", "Mengobrol lama"]],
  ["ldr-photo", "ldr", "Foto seperti apa yang paling ingin dia terima saat LDR?", ["Selfie spontan", "Foto kegiatan harian", "Foto tempat yang dikunjungi", "Foto dengan pesan khusus"]],

  ["first-memory", "kenangan", "Bagian mana dari awal hubungan yang paling mungkin dia ingat?", ["Percakapan pertama", "Pertemuan pertama", "Kencan pertama", "Saat menyadari perasaannya"]],
  ["favorite-memory", "kenangan", "Jenis kenangan apa yang paling ingin dia ulang bersama?", ["Perjalanan", "Kencan sederhana", "Percakapan malam", "Momen lucu"]],
  ["keepsake", "kenangan", "Benda kenangan apa yang paling mungkin dia simpan?", ["Tiket atau struk", "Foto cetak", "Surat atau catatan", "Hadiah kecil"]],
  ["old-message", "kenangan", "Jika membuka chat lama, bagian mana yang paling ingin dia baca?", ["Awal pendekatan", "Pesan romantis", "Percakapan lucu", "Momen saling mendukung"]],
  ["relationship-milestone", "kenangan", "Momen hubungan mana yang paling berarti baginya?", ["Pertama kali bertemu", "Mulai berpacaran", "Melewati masalah bersama", "Merencanakan masa depan"]],

  ["future-home", "masa-depan", "Tempat tinggal seperti apa yang paling dia bayangkan untuk masa depan?", ["Apartemen di kota", "Rumah di pinggiran", "Rumah dekat keluarga", "Tempat yang bisa berpindah-pindah"]],
  ["future-travel", "masa-depan", "Perjalanan masa depan mana yang paling ingin dia lakukan bersamamu?", ["Keliling Indonesia", "Pergi ke luar negeri", "Road trip", "Liburan tenang di satu tempat"]],
  ["future-weekend", "masa-depan", "Bagaimana dia membayangkan akhir pekan kalian di masa depan?", ["Memasak di rumah", "Mengunjungi keluarga", "Menjelajah tempat baru", "Beristirahat tanpa rencana"]],
  ["future-tradition", "masa-depan", "Tradisi pasangan mana yang paling ingin dia bangun?", ["Date night rutin", "Liburan tahunan", "Merayakan pencapaian", "Membuat album kenangan"]],
  ["future-project", "masa-depan", "Proyek bersama mana yang paling ingin dia lakukan?", ["Menata tempat tinggal", "Membangun usaha", "Menabung untuk perjalanan", "Membuat karya bersama"]],

  ["feel-loved", "mendalam", "Kapan dia paling merasa dicintai olehmu?", ["Saat didengarkan", "Saat diprioritaskan", "Saat dibantu", "Saat diterima apa adanya"]],
  ["feel-safe", "mendalam", "Apa yang paling membuatnya merasa aman dalam hubungan?", ["Kejujuran", "Konsistensi", "Komunikasi terbuka", "Komitmen yang jelas"]],
  ["relationship-value", "mendalam", "Nilai apa yang paling penting baginya dalam hubungan?", ["Kepercayaan", "Kesetiaan", "Pertumbuhan bersama", "Kebebasan menjadi diri sendiri"]],
  ["difficult-day", "mendalam", "Pada hari yang sangat berat, apa yang paling dia harapkan darimu?", ["Hadir dan mendengar", "Membantu secara praktis", "Memberi semangat", "Memberi ruang dengan tetap menemani"]],
  ["meaningful-time", "mendalam", "Quality time seperti apa yang paling bermakna baginya?", ["Percakapan tanpa gangguan", "Melakukan aktivitas bersama", "Berdiam dalam kenyamanan", "Menciptakan pengalaman baru"]],
] as const satisfies readonly QuizQuestionSeed[];

export const QUIZ_QUESTIONS: readonly QuizQuestion[] =
  QUIZ_QUESTION_BANK.map(
    ([id, category, prompt, options]) => ({
      id,
      category,
      prompt,
      options,
    }),
  );

const QUESTION_BY_ID = new Map<string, QuizQuestion>(
  QUIZ_QUESTIONS.map((question) => [
    question.id,
    question,
  ]),
);

export function getQuizQuestion(
  id: string,
): QuizQuestion {
  const question = QUESTION_BY_ID.get(id);

  if (!question) {
    throw new Error(
      `Pertanyaan kuis "${id}" tidak ditemukan.`,
    );
  }

  return question;
}