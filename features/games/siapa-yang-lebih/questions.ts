export type MostLikelyQuestion = {
  id: string;
  text: string;
};

export const MOST_LIKELY_QUESTIONS: readonly MostLikelyQuestion[] = [
  {
    id: "first-apology",
    text: "Siapa yang lebih dulu meminta maaf setelah bertengkar?",
  },
  {
    id: "miss-first",
    text: "Siapa yang lebih cepat merasa rindu?",
  },
  {
    id: "romantic-surprise",
    text: "Siapa yang lebih mungkin menyiapkan kejutan romantis?",
  },
  {
    id: "late-reply",
    text: "Siapa yang lebih sering terlambat membalas pesan?",
  },
  {
    id: "choose-food",
    text: "Siapa yang paling lama memilih makanan?",
  },
  {
    id: "remember-dates",
    text: "Siapa yang lebih baik mengingat tanggal penting?",
  },
  {
    id: "fall-asleep",
    text: "Siapa yang lebih dulu tertidur saat telepon malam?",
  },
  {
    id: "start-conversation",
    text: "Siapa yang lebih sering memulai percakapan?",
  },
  {
    id: "take-photos",
    text: "Siapa yang lebih suka mengambil foto berdua?",
  },
  {
    id: "plan-date",
    text: "Siapa yang lebih sering merencanakan kencan?",
  },
];

export function getMostLikelyQuestion(
  id: string,
): MostLikelyQuestion | null {
  return MOST_LIKELY_QUESTIONS.find((question) => question.id === id) ?? null;
}