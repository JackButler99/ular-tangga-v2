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
  ["first-apology", "komunikasi", "Setelah suasana mulai tenang, siapa yang lebih dulu mengajak berdamai?"],
  ["miss-first", "romantis", "Saat sehari terasa lebih panjang dari biasanya, siapa yang lebih dulu bilang rindu?"],
  ["romantic-surprise", "romantis", "Siapa yang lebih mungkin menyiapkan kejutan kecil hanya untuk membuat pasangannya tersenyum?"],
  ["late-reply", "kebiasaan", "Siapa yang lebih sering menyusun balasan di kepala, lalu lupa benar-benar mengirimnya?"],
  ["choose-food", "ringan", "Ketika ditanya mau makan apa, siapa yang membutuhkan waktu paling lama untuk memutuskan?"],
  ["remember-dates", "romantis", "Siapa yang lebih mungkin mengingat tanggal penting tanpa bantuan pengingat?"],
  ["fall-asleep-call", "ldr", "Saat mengobrol larut malam, siapa yang lebih dulu tertidur di tengah percakapan?"],
  ["start-conversation", "komunikasi", "Setelah hari yang sibuk, siapa yang lebih dulu membuka percakapan tentang kabar hari ini?"],
  ["take-photos", "kenangan", "Ketika sedang menikmati momen bagus, siapa yang lebih dulu mengeluarkan kamera?"],
  ["plan-date", "kencan", "Siapa yang lebih menikmati menyusun detail kencan dari awal sampai akhir?"],
  ["jealous-first", "romantis", "Siapa yang lebih cepat menyadari ketika dirinya mulai sedikit cemburu?"],
  ["laugh-first", "ringan", "Siapa yang lebih mudah tertawa hanya karena melihat pasangannya mulai tertawa?"],
  ["sad-movie", "ringan", "Saat menonton adegan yang menyentuh, siapa yang lebih dulu berkaca-kaca?"],
  ["get-lost", "ringan", "Di tempat baru, siapa yang lebih mungkin yakin tahu jalan padahal arahnya keliru?"],
  ["impulsive-shopping", "kebiasaan", "Siapa yang lebih mungkin membeli sesuatu karena langsung merasa, ‘Ini lucu banget’?"],
  ["sing-randomly", "ringan", "Siapa yang lebih sering mengubah percakapan biasa menjadi potongan lagu?"],
  ["forget-items", "kebiasaan", "Siapa yang lebih sering mencari barang yang ternyata ada di dekatnya sendiri?"],
  ["wake-early", "kebiasaan", "Kalau tidak memasang alarm, siapa yang lebih mungkin tetap bangun lebih pagi?"],
  ["finish-snacks", "ringan", "Saat berbagi camilan, siapa yang lebih mungkin mengambil potongan terakhir?"],
  ["dance-randomly", "ringan", "Ketika lagu favorit tiba-tiba diputar, siapa yang lebih dulu ikut bergoyang?"],

  ["first-hug", "romantis", "Saat akhirnya bertemu setelah hari yang panjang, siapa yang lebih dulu membuka tangan untuk memeluk?"],
  ["say-love", "romantis", "Di tengah hari biasa tanpa momen khusus, siapa yang lebih dulu mengucapkan sayang?"],
  ["give-compliment", "romantis", "Siapa yang lebih sering memberikan pujian spontan atas hal kecil yang dilakukan pasangannya?"],
  ["initiate-call", "ldr", "Ketika sama-sama sibuk, siapa yang lebih dulu mencari celah waktu untuk menelepon?"],
  ["cute-nickname", "romantis", "Siapa yang lebih mungkin menciptakan panggilan sayang baru dari kejadian yang lucu?"],
  ["save-chat", "kenangan", "Siapa yang lebih mungkin menyimpan tangkapan layar percakapan yang terasa istimewa?"],
  ["send-meme", "ringan", "Siapa yang lebih sering mengirim meme dengan pesan, ‘Ini kamu banget’?"],
  ["romantic-person", "romantis", "Kalau dinilai dari tindakan kecil sehari-hari, siapa yang diam-diam lebih romantis?"],
  ["hold-hands", "romantis", "Saat berjalan berdampingan, siapa yang lebih dulu mencari tangan pasangannya?"],
  ["personal-gift", "romantis", "Siapa yang lebih pandai menemukan hadiah yang terasa sangat personal?"],

  ["overthink", "komunikasi", "Siapa yang lebih mudah membaca terlalu jauh arti sebuah pesan singkat?"],
  ["more-stubborn", "komunikasi", "Saat pendapat kalian berbeda, siapa yang biasanya bertahan lebih lama dengan sudut pandangnya?"],
  ["calm-conflict", "komunikasi", "Ketika percakapan mulai memanas, siapa yang lebih mampu menjaga nada bicara tetap tenang?"],
  ["need-space", "komunikasi", "Setelah perbedaan pendapat, siapa yang lebih membutuhkan waktu sendiri sebelum melanjutkan obrolan?"],
  ["talk-feelings", "komunikasi", "Siapa yang lebih mudah menemukan kata-kata untuk menjelaskan perasaannya?"],
  ["forgive-first", "komunikasi", "Setelah masalah benar-benar dibicarakan, siapa yang lebih cepat kembali mencair?"],
  ["worry-more", "komunikasi", "Ketika pasangan lebih lama tidak memberi kabar dari biasanya, siapa yang lebih cepat merasa khawatir?"],
  ["ask-advice", "komunikasi", "Sebelum membuat keputusan penting, siapa yang lebih sering meminta pendapat pasangannya?"],
  ["notice-mood", "romantis", "Siapa yang lebih cepat menangkap perubahan suasana hati hanya dari cara pasangannya mengetik atau berbicara?"],
  ["cheer-up", "romantis", "Saat pasangannya sedang murung, siapa yang lebih cepat menemukan cara untuk membuat suasana terasa ringan?"],

  ["long-call", "ldr", "Saat berjauhan, siapa yang lebih betah mengobrol di telepon sampai lupa waktu?"],
  ["sleep-video-call", "ldr", "Siapa yang lebih mungkin tertidur sementara video call masih tersambung?"],
  ["countdown-reunion", "ldr", "Siapa yang lebih rajin menghitung hari menuju pertemuan berikutnya?"],
  ["send-package", "ldr", "Siapa yang lebih mungkin mengirim paket kejutan untuk menemani hari pasangan dari jauh?"],
  ["surprise-visit", "ldr", "Siapa yang lebih mungkin menyusun rencana kunjungan kejutan dengan sangat rahasia?"],
  ["call-screenshot", "ldr", "Siapa yang lebih sering diam-diam mengambil tangkapan layar saat video call?"],
  ["adjust-schedule", "ldr", "Ketika jadwal sulit bertemu, siapa yang lebih dulu mencoba menggeser kegiatannya agar bisa mengobrol?"],
  ["feel-lonely", "ldr", "Saat jarak mulai terasa berat, siapa yang lebih dulu mengajak membuat quality time khusus?"],
  ["morning-message", "ldr", "Siapa yang lebih konsisten mengirim kabar kecil pada awal hari?"],
  ["goodnight-message", "ldr", "Siapa yang merasa harinya belum lengkap sebelum mengucapkan selamat malam?"],

  ["future-home", "masa-depan", "Siapa yang lebih sering membayangkan suasana tempat tinggal yang terasa seperti rumah bagi kalian?"],
  ["future-trip", "masa-depan", "Siapa yang lebih sering menyimpan ide perjalanan untuk diwujudkan bersama suatu hari nanti?"],
  ["want-pet", "masa-depan", "Siapa yang lebih dulu mengusulkan nama untuk hewan peliharaan yang bahkan belum kalian punya?"],
  ["shared-saving", "masa-depan", "Siapa yang lebih disiplin menjaga tabungan ketika kalian punya tujuan bersama?"],
  ["choose-decoration", "masa-depan", "Siapa yang lebih bersemangat membayangkan warna, furnitur, dan sudut favorit di tempat tinggal bersama?"],
  ["better-cook", "masa-depan", "Kalau harus menyiapkan makan malam setelah hari yang panjang, siapa yang lebih mungkin mengambil alih dapur?"],
  ["meet-family", "masa-depan", "Menjelang bertemu keluarga besar pasangan, siapa yang lebih mungkin merasa gugup sejak jauh hari?"],
  ["plan-big-event", "masa-depan", "Kalau kalian menyiapkan acara penting bersama, siapa yang lebih teliti memikirkan detail-detail kecilnya?"],
  ["couple-tradition", "masa-depan", "Siapa yang lebih mungkin menciptakan tradisi tahunan yang hanya dimiliki kalian berdua?"],
  ["move-city", "masa-depan", "Jika ada peluang hidup baru di kota lain, siapa yang lebih cepat siap mempertimbangkannya bersama?"],

  ["remember-first-date", "kenangan", "Siapa yang lebih mungkin masih mengingat detail kecil dari kencan pertama kalian?"],
  ["keep-tickets", "kenangan", "Siapa yang lebih mungkin menyimpan tiket, struk, atau benda kecil dari momen berdua?"],
  ["reread-messages", "kenangan", "Saat sedang rindu, siapa yang lebih mungkin membaca kembali percakapan lama?"],
  ["photo-album", "kenangan", "Siapa yang lebih bersemangat mengubah foto-foto kalian menjadi album sungguhan?"],
  ["celebrate-small-milestone", "kenangan", "Siapa yang lebih suka merayakan kemajuan kecil dalam perjalanan hubungan kalian?"],
  ["replay-song", "kenangan", "Siapa yang lebih sering memutar lagu tertentu karena langsung teringat pada pasangan?"],
  ["tell-first-impression", "kenangan", "Siapa yang bisa menceritakan kesan pertamanya tentang pasangan dengan lebih rinci?"],
  ["remember-outfit", "kenangan", "Siapa yang lebih mungkin mengingat pakaian pasangannya pada suatu momen penting?"],
  ["archive-photos", "kenangan", "Siapa yang lebih rajin menyimpan, memilih, dan merapikan foto-foto berdua?"],
  ["more-sentimental", "kenangan", "Siapa yang lebih mudah tersentuh ketika menemukan kembali benda penuh kenangan?"],

  ["spontaneous-date", "kencan", "Siapa yang lebih mungkin tiba-tiba berkata, ‘Ayo keluar sekarang,’ tanpa rencana sebelumnya?"],
  ["candle-dinner", "kencan", "Siapa yang lebih mungkin mengubah makan malam biasa menjadi terasa romantis?"],
  ["picnic-date", "kencan", "Kalau ingin piknik berdua, siapa yang lebih bersemangat menyiapkan bekal dan perlengkapannya?"],
  ["write-letter", "romantis", "Siapa yang lebih mungkin menuangkan perasaannya dalam surat atau catatan tulisan tangan?"],
  ["give-flowers", "romantis", "Siapa yang lebih mungkin memberi bunga atau hadiah kecil tanpa menunggu hari khusus?"],
  ["make-playlist", "romantis", "Siapa yang lebih mungkin menyusun playlist yang setiap lagunya punya alasan khusus?"],
  ["breakfast-surprise", "romantis", "Siapa yang lebih mungkin menyiapkan sarapan atau minuman favorit sebagai kejutan?"],
  ["travel-far", "kencan", "Siapa yang lebih rela menempuh perjalanan jauh hanya demi punya beberapa jam bersama?"],
  ["watch-stars", "kencan", "Siapa yang lebih mungkin mengajak berhenti sejenak hanya untuk menikmati langit malam bersama?"],
  ["say-proud", "romantis", "Siapa yang lebih sering mengingatkan pasangannya bahwa usaha mereka layak dibanggakan?"],
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