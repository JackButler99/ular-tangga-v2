export const QUESTION_COUNT_OPTIONS = [5, 10, 15] as const;

export type QuestionCount =
  (typeof QUESTION_COUNT_OPTIONS)[number];

export const DEFAULT_QUESTION_COUNT: QuestionCount = 10;

export function isQuestionCount(
  value: unknown,
): value is QuestionCount {
  return QUESTION_COUNT_OPTIONS.some(
    (option) => option === value,
  );
}

export function selectQuestionIds<
  T extends { id: string },
>(
  bank: readonly T[],
  count: QuestionCount,
): string[] {
  if (bank.length < count) {
    throw new Error(
      `Bank hanya memiliki ${bank.length} pertanyaan.`,
    );
  }

  const shuffled = [...bank];

  for (
    let index = shuffled.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [shuffled[index], shuffled[randomIndex]] = [
      shuffled[randomIndex],
      shuffled[index],
    ];
  }

  return shuffled
    .slice(0, count)
    .map((question) => question.id);
}