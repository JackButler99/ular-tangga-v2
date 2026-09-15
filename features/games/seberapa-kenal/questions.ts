export type QuizQuestion = {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string];
};

export const QUIZ_QUESTIONS: readonly QuizQuestion[] = [
  {
    id: "malam-minggu",
    prompt: "Pilihan paling ideal untuk malam minggu?",
    options: [
      "Nonton film",
      "Mencari makanan",
      "Jalan tanpa rencana",
      "Santai sambil ngobrol",
    ],
  },
  {
    id: "hadiah-kecil",
    prompt: "Hadiah kecil mana yang paling menyenangkan?",
    options: [
      "Makanan favorit",
      "Surat buatan tangan",
      "Bunga",
      "Playlist khusus",
    ],
  },
  {
    id: "liburan",
    prompt: "Tempat liburan mana yang paling menarik?",
    options: [
      "Pantai",
      "Pegunungan",
      "Kota besar",
      "Desa yang tenang",
    ],
  },
  {
    id: "saat-rindu",
    prompt: "Apa yang paling ingin dilakukan ketika sedang rindu?",
    options: [
      "Video call",
      "Mengirim voice note",
      "Melihat foto bersama",
      "Merencanakan pertemuan",
    ],
  },
  {
    id: "makanan-nyaman",
    prompt: "Jenis makanan apa yang paling cocok saat suasana hati buruk?",
    options: [
      "Makanan pedas",
      "Makanan manis",
      "Makanan berkuah",
      "Makanan cepat saji",
    ],
  },
  {
    id: "date-sederhana",
    prompt: "Date sederhana mana yang paling menyenangkan?",
    options: [
      "Piknik",
      "Memasak bersama",
      "Keliling kota",
      "Maraton film",
    ],
  },
  {
    id: "kejutan",
    prompt: "Kejutan seperti apa yang paling disukai?",
    options: [
      "Kunjungan mendadak",
      "Hadiah kecil",
      "Pesan romantis panjang",
      "Rencana date rahasia",
    ],
  },
  {
    id: "foto-bersama",
    prompt: "Foto bersama seperti apa yang paling disukai?",
    options: [
      "Foto candid",
      "Foto lucu",
      "Foto estetik",
      "Foto momen spesial",
    ],
  },
];

const QUESTION_BY_ID = new Map(
  QUIZ_QUESTIONS.map((question) => [question.id, question]),
);

export function getQuizQuestion(id: string) {
  const question = QUESTION_BY_ID.get(id);

  if (!question) {
    throw new Error(`Pertanyaan tidak ditemukan: ${id}`);
  }

  return question;
}