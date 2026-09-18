import { describe, expect, it } from "vitest";

import {
  continueQuiz,
  createInitialQuizState,
  otherPlayer,
  submitGuess,
  submitSubjectAnswer,
} from "./engine";

describe("couple quiz engine", () => {
  it("membuat state awal yang benar", () => {
    const state = createInitialQuizState();

    expect(state.schemaVersion).toBe(1);
    expect(state.phase).toBe("subject-answer");
    expect(state.subject).toBe("host");
    expect(state.roundIndex).toBe(0);
    expect(state.subjectAnswer).toBeNull();
    expect(state.guessAnswer).toBeNull();
    expect(state.scores).toEqual({
      host: 0,
      guest: 0,
    });

    expect(state.questionIds).toHaveLength(10);
    expect(new Set(state.questionIds).size).toBe(10);
  });

  it("memberikan skor kepada pemain yang menebak benar", () => {
    let state = createInitialQuizState();

    state = submitSubjectAnswer(state, "host", 0);

    expect(state.phase).toBe("guesser-answer");
    expect(state.subjectAnswer).toBe(0);

    state = submitGuess(state, "guest", 0);

    expect(state.phase).toBe("reveal");
    expect(state.guessAnswer).toBe(0);
    expect(state.scores.guest).toBe(1);
    expect(state.scores.host).toBe(0);
  });

  it("tidak memberikan skor untuk tebakan salah", () => {
    let state = createInitialQuizState();

    state = submitSubjectAnswer(state, "host", 0);
    state = submitGuess(state, "guest", 1);

    expect(state.phase).toBe("reveal");
    expect(state.scores).toEqual({
      host: 0,
      guest: 0,
    });
  });

  it("menolak pemain yang bukan subject", () => {
    const state = createInitialQuizState();

    expect(() => {
      submitSubjectAnswer(state, "guest", 0);
    }).toThrow();
  });

  it("mengganti subject setelah ronde dilanjutkan", () => {
    let state = createInitialQuizState();

    state = submitSubjectAnswer(state, "host", 0);
    state = submitGuess(state, "guest", 0);
    state = continueQuiz(state);

    expect(state.phase).toBe("subject-answer");
    expect(state.roundIndex).toBe(1);
    expect(state.subject).toBe("guest");
    expect(state.subjectAnswer).toBeNull();
    expect(state.guessAnswer).toBeNull();
  });

  it("dapat menyelesaikan seluruh ronde", () => {
    let state = createInitialQuizState();
    const totalRounds = state.questionIds.length;

    for (let round = 0; round < totalRounds; round += 1) {
      const subject = state.subject;
      const guesser = otherPlayer(subject);

      state = submitSubjectAnswer(state, subject, 0);
      state = submitGuess(state, guesser, 0);

      expect(state.phase).toBe("reveal");

      state = continueQuiz(state);
    }

    expect(state.phase).toBe("finished");
    expect(state.scores.host + state.scores.guest).toBe(totalRounds);
  });
});