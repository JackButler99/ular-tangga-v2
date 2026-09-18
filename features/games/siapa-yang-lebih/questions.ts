export type MostLikelyQuestionCategory =
  | "ringan"
  | "kebiasaan"
  | "romantis"
  | "komunikasi"
  | "ldr"
  | "kenangan"
  | "masa-depan"
  | "kencan";

export type MostLikelyQuestion = {
  id: string;
  category: MostLikelyQuestionCategory;
  text: string;
};

type MostLikelyQuestionSeed = readonly [
  id: string,
  category: MostLikelyQuestionCategory,
  text: string,
];

const MOST_LIKELY_QUESTION_BANK = [
  ["first-apology", "komunikasi", "Siapa yang lebih dulu meminta maaf setelah bertengkar?"],
  ["miss-first", "romantis", "Siapa yang lebih cepat merasa rindu?"],
  ["romantic-surprise", "romantis", "Siapa yang lebih mungkin menyiapkan kejutan romantis?"],
  ["late-reply", "kebiasaan", "Siapa yang lebih sering terlambat membalas pesan?"],
  ["choose-food", "ringan", "Siapa yang paling lama memilih makanan?"],
  ["remember-dates", "romantis", "Siapa yang lebih baik mengingat tanggal penting?"],
  ["fall-asleep-call", "ldr", "Siapa yang lebih dulu tertidur saat telepon malam?"],
  ["start-conversation", "komunikasi", "Siapa yang lebih sering memulai percakapan?"],
  ["take-photos", "kenangan", "Siapa yang lebih suka mengambil foto berdua?"],
  ["plan-date", "kencan", "Siapa yang lebih sering merencanakan kencan?"],
  ["jealous-first", "romantis", "Siapa yang lebih mudah merasa cemburu?"],
  ["laugh-first", "ringan", "Siapa yang lebih mudah tertawa karena hal kecil?"],
  ["sad-movie", "ringan", "Siapa yang lebih mudah menangis saat menonton film?"],
  ["get-lost", "ringan", "Siapa yang lebih mungkin tersesat di tempat baru?"],
  ["impulsive-shopping", "kebiasaan", "Siapa yang lebih sering membeli sesuatu secara spontan?"],
  ["sing-randomly", "ringan", "Siapa yang lebih sering bernyanyi tanpa alasan?"],
  ["forget-items", "kebiasaan", "Siapa yang lebih sering lupa menaruh barang?"],
  ["wake-early", "kebiasaan", "Siapa yang lebih mudah bangun pagi?"],
  ["finish-snacks", "ringan", "Siapa yang lebih mungkin menghabiskan camilan berdua?"],
  ["dance-randomly", "ringan", "Siapa yang lebih mungkin menari ketika mendengar lagu favorit?"],

  ["first-hug", "romantis", "Siapa yang lebih sering memulai pelukan?"],
  ["say-love", "romantis", "Siapa yang lebih sering mengatakan sayang terlebih dahulu?"],
  ["give-compliment", "romantis", "Siapa yang lebih sering memberikan pujian spontan?"],
  ["initiate-call", "ldr", "Siapa yang lebih sering mengajak telepon lebih dahulu?"],
  ["cute-nickname", "romantis", "Siapa yang lebih mungkin menciptakan panggilan sayang baru?"],
  ["save-chat", "kenangan", "Siapa yang lebih mungkin menyimpan screenshot percakapan manis?"],
  ["send-meme", "ringan", "Siapa yang lebih sering mengirim meme kepada pasangan?"],
  ["romantic-person", "romantis", "Siapa yang sebenarnya lebih romantis?"],
  ["hold-hands", "romantis", "Siapa yang lebih sering memulai menggenggam tangan?"],
  ["personal-gift", "romantis", "Siapa yang lebih pandai memilih hadiah personal?"],

  ["overthink", "komunikasi", "Siapa yang lebih sering memikirkan sesuatu terlalu jauh?"],
  ["more-stubborn", "komunikasi", "Siapa yang lebih sulit mengalah saat berbeda pendapat?"],
  ["calm-conflict", "komunikasi", "Siapa yang lebih mampu tetap tenang saat ada masalah?"],
  ["need-space", "komunikasi", "Siapa yang lebih membutuhkan waktu sendiri setelah bertengkar?"],
  ["talk-feelings", "komunikasi", "Siapa yang lebih mudah membicarakan perasaannya?"],
  ["forgive-first", "komunikasi", "Siapa yang lebih cepat memaafkan?"],
  ["worry-more", "komunikasi", "Siapa yang lebih mudah khawatir ketika pasangan sulit dihubungi?"],
  ["ask-advice", "komunikasi", "Siapa yang lebih sering meminta pendapat pasangan?"],
  ["notice-mood", "romantis", "Siapa yang lebih cepat menyadari perubahan suasana hati pasangan?"],
  ["cheer-up", "romantis", "Siapa yang lebih pandai menghibur pasangan saat sedih?"],

  ["long-call", "ldr", "Siapa yang lebih kuat melakukan panggilan berjam-jam?"],
  ["sleep-video-call", "ldr", "Siapa yang lebih mungkin tertidur ketika video call masih menyala?"],
  ["countdown-reunion", "ldr", "Siapa yang lebih rajin menghitung hari menuju pertemuan berikutnya?"],
  ["send-package", "ldr", "Siapa yang lebih mungkin mengirim paket kejutan saat LDR?"],
  ["surprise-visit", "ldr", "Siapa yang lebih mungkin merencanakan kunjungan kejutan?"],
  ["call-screenshot", "ldr", "Siapa yang lebih sering mengambil screenshot saat video call?"],
  ["adjust-schedule", "ldr", "Siapa yang lebih sering menyesuaikan jadwal agar bisa mengobrol?"],
  ["feel-lonely", "ldr", "Siapa yang lebih cepat merasa kesepian saat berjauhan?"],
  ["morning-message", "ldr", "Siapa yang lebih konsisten mengirim pesan selamat pagi?"],
  ["goodnight-message", "ldr", "Siapa yang sulit tidur sebelum mengucapkan selamat malam?"],

  ["future-home", "masa-depan", "Siapa yang lebih sering membayangkan tempat tinggal bersama?"],
  ["future-trip", "masa-depan", "Siapa yang lebih sering merencanakan perjalanan masa depan?"],
  ["want-pet", "masa-depan", "Siapa yang lebih ingin memiliki hewan peliharaan bersama?"],
  ["shared-saving", "masa-depan", "Siapa yang lebih disiplin menabung untuk tujuan bersama?"],
  ["choose-decoration", "masa-depan", "Siapa yang lebih bersemangat memilih dekorasi tempat tinggal?"],
  ["better-cook", "masa-depan", "Siapa yang lebih mungkin memasak untuk pasangan?"],
  ["meet-family", "masa-depan", "Siapa yang lebih gugup saat bertemu keluarga pasangan?"],
  ["plan-big-event", "masa-depan", "Siapa yang lebih detail merencanakan acara besar bersama?"],
  ["couple-tradition", "masa-depan", "Siapa yang lebih mungkin menciptakan tradisi khusus untuk kalian?"],
  ["move-city", "masa-depan", "Siapa yang lebih berani pindah kota demi rencana bersama?"],

  ["remember-first-date", "kenangan", "Siapa yang lebih ingat detail kencan pertama?"],
  ["keep-tickets", "kenangan", "Siapa yang lebih mungkin menyimpan tiket atau struk kenangan?"],
  ["reread-messages", "kenangan", "Siapa yang lebih sering membaca kembali pesan lama?"],
  ["photo-album", "kenangan", "Siapa yang lebih ingin membuat album foto hubungan?"],
  ["celebrate-small-milestone", "kenangan", "Siapa yang lebih suka merayakan pencapaian kecil hubungan?"],
  ["replay-song", "kenangan", "Siapa yang lebih sering memutar lagu yang mengingatkan pada pasangan?"],
  ["tell-first-impression", "kenangan", "Siapa yang lebih ingat kesan pertama saat kalian bertemu?"],
  ["remember-outfit", "kenangan", "Siapa yang lebih mungkin mengingat pakaian pasangan pada momen penting?"],
  ["archive-photos", "kenangan", "Siapa yang lebih rajin menyimpan dan merapikan foto berdua?"],
  ["more-sentimental", "kenangan", "Siapa yang lebih sentimental terhadap benda-benda kenangan?"],

  ["spontaneous-date", "kencan", "Siapa yang lebih mungkin mengajak kencan secara spontan?"],
  ["candle-dinner", "kencan", "Siapa yang lebih mungkin menyiapkan makan malam romantis?"],
  ["picnic-date", "kencan", "Siapa yang lebih bersemangat menyiapkan piknik berdua?"],
  ["write-letter", "romantis", "Siapa yang lebih mungkin menulis surat cinta?"],
  ["give-flowers", "romantis", "Siapa yang lebih mungkin memberikan bunga tanpa alasan khusus?"],
  ["make-playlist", "romantis", "Siapa yang lebih mungkin membuat playlist khusus untuk pasangan?"],
  ["breakfast-surprise", "romantis", "Siapa yang lebih mungkin menyiapkan sarapan kejutan?"],
  ["travel-far", "kencan", "Siapa yang lebih rela bepergian jauh demi bertemu pasangan?"],
  ["watch-stars", "kencan", "Siapa yang lebih mungkin mengajak melihat bintang bersama?"],
  ["say-proud", "romantis", "Siapa yang lebih sering mengatakan bahwa dirinya bangga pada pasangan?"],
] as const satisfies readonly MostLikelyQuestionSeed[];

export const MOST_LIKELY_QUESTIONS:
  readonly MostLikelyQuestion[] =
    MOST_LIKELY_QUESTION_BANK.map(
      ([id, category, text]) => ({
        id,
        category,
        text,
      }),
    );

const QUESTION_BY_ID = new Map<
  string,
  MostLikelyQuestion
>(
  MOST_LIKELY_QUESTIONS.map((question) => [
    question.id,
    question,
  ]),
);

export function getMostLikelyQuestion(
  id: string,
): MostLikelyQuestion | null {
  return QUESTION_BY_ID.get(id) ?? null;
}