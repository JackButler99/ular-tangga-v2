import { describe, expect, it } from "vitest";

import {
  isQuestionCount,
  QUESTION_COUNT_OPTIONS,
  selectQuestionIds,
} from "./question-count";

describe("question count", () => {
  const bank = Array.from(
    {
      length: 20,
    },
    (_, index) => ({
      id: `question-${index + 1}`,
    }),
  );

  it("menerima jumlah pertanyaan yang didukung", () => {
    expect(isQuestionCount(5)).toBe(true);
    expect(isQuestionCount(10)).toBe(true);
    expect(isQuestionCount(15)).toBe(true);

    expect(isQuestionCount(0)).toBe(false);
    expect(isQuestionCount(7)).toBe(false);
    expect(isQuestionCount("10")).toBe(false);
  });

  it("memilih jumlah ID yang diminta tanpa duplikasi", () => {
    for (const count of QUESTION_COUNT_OPTIONS) {
      const selected = selectQuestionIds(
        bank,
        count,
      );

      expect(selected).toHaveLength(count);
      expect(new Set(selected).size).toBe(count);
    }
  });

  it("tidak mengubah urutan bank asli", () => {
    const originalIds = bank.map(
      (question) => question.id,
    );

    selectQuestionIds(bank, 15);

    expect(
      bank.map((question) => question.id),
    ).toEqual(originalIds);
  });
});