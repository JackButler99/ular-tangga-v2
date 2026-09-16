import { describe, expect, it } from "vitest";

import {
  continueMostLikely,
  createInitialMostLikelyState,
  submitMostLikelyAnswer,
} from "./engine";

describe("most likely game engine", () => {
  it("membuat enam ronde tanpa pertanyaan ganda", () => {
    const state = createInitialMostLikelyState();

    expect(state.phase).toBe("answering");
    expect(state.roundIndex).toBe(0);
    expect(state.questionIds).toHaveLength(6);
    expect(new Set(state.questionIds).size).toBe(6);
    expect(state.agreementCount).toBe(0);
  });

  it("menunggu sampai kedua pemain menjawab", () => {
    let state = createInitialMostLikelyState();

    state = submitMostLikelyAnswer(state, "host", "host");

    expect(state.phase).toBe("answering");
    expect(state.answers.host).toBe("host");
    expect(state.answers.guest).toBeNull();
  });

  it("membuka hasil setelah kedua pemain menjawab", () => {
    let state = createInitialMostLikelyState();

    state = submitMostLikelyAnswer(state, "host", "host");
    state = submitMostLikelyAnswer(state, "guest", "host");

    expect(state.phase).toBe("reveal");
    expect(state.agreementCount).toBe(1);
  });

  it("menolak pemain yang menjawab dua kali", () => {
    let state = createInitialMostLikelyState();

    state = submitMostLikelyAnswer(state, "host", "guest");

    expect(() => {
      submitMostLikelyAnswer(state, "host", "host");
    }).toThrow();
  });

  it("mereset jawaban pada ronde selanjutnya", () => {
    let state = createInitialMostLikelyState();

    state = submitMostLikelyAnswer(state, "host", "host");
    state = submitMostLikelyAnswer(state, "guest", "guest");
    state = continueMostLikely(state);

    expect(state.roundIndex).toBe(1);
    expect(state.phase).toBe("answering");
    expect(state.answers).toEqual({
      host: null,
      guest: null,
    });
  });

  it("menyelesaikan seluruh permainan", () => {
    let state = createInitialMostLikelyState();
    const totalRounds = state.questionIds.length;

    for (let round = 0; round < totalRounds; round += 1) {
      state = submitMostLikelyAnswer(state, "host", "host");
      state = submitMostLikelyAnswer(state, "guest", "host");
      state = continueMostLikely(state);
    }

    expect(state.phase).toBe("finished");
    expect(state.agreementCount).toBe(totalRounds);
  });
});