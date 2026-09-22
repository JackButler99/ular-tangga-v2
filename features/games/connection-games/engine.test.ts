import { describe, expect, it } from "vitest";

import {
  getPickOneRound,
  PICK_ONE_ROUNDS,
} from "./content";
import {
  continuePickOne,
  createInitialPickOneState,
  isPowerRound,
  selectPickOneRoundIds,
  submitPickOneAnswer,
} from "./engine";

describe("bank Pilih Mana", () => {
  it("memiliki minimal 20 ronde unik", () => {
    expect(PICK_ONE_ROUNDS.length).toBeGreaterThanOrEqual(20);
    expect(
      new Set(PICK_ONE_ROUNDS.map((round) => round.id)).size,
    ).toBe(PICK_ONE_ROUNDS.length);
  });

  it("setiap ronde memiliki dua pilihan berbeda", () => {
    for (const round of PICK_ONE_ROUNDS) {
      expect(round.options).toHaveLength(2);
      expect(round.options[0].label).not.toBe(
        round.options[1].label,
      );
      expect(round.reflection.length).toBeGreaterThan(10);
    }
  });
});

describe("Pilih Mana engine", () => {
  it("membuat lima ronde unik", () => {
    const state = createInitialPickOneState(5);

    expect(state.kind).toBe("pick-one");
    expect(state.roundIds).toHaveLength(5);
    expect(new Set(state.roundIds).size).toBe(5);
    expect(state.phase).toBe("answering");
    expect(state.betsRemaining).toEqual({
      host: 2,
      guest: 2,
    });
  });

  it("menyusun ronde menjadi tiga babak", () => {
    const chapters = selectPickOneRoundIds(15).map(
      (id) => getPickOneRound(id).chapter,
    );

    expect(chapters.slice(0, 4)).toEqual(
      Array(4).fill("pemanasan"),
    );
    expect(chapters.slice(4, 10)).toEqual(
      Array(6).fill("koneksi"),
    );
    expect(chapters.slice(10)).toEqual(
      Array(5).fill("lebih-dalam"),
    );
  });

  it("menunggu sampai kedua pemain memilih", () => {
    let state = createInitialPickOneState(5);

    state = submitPickOneAnswer(state, "host", "a");
    expect(state.phase).toBe("answering");

    state = submitPickOneAnswer(state, "guest", "b");
    expect(state.phase).toBe("reveal");
    expect(state.matchCount).toBe(0);
  });

  it("menghitung jawaban yang sama", () => {
    let state = createInitialPickOneState(5);

    state = submitPickOneAnswer(state, "host", "b");
    state = submitPickOneAnswer(state, "guest", "b");

    expect(state.matchCount).toBe(1);
    expect(state.sparkCount).toBe(1);
    expect(state.currentStreak).toBe(1);
    expect(state.bestStreak).toBe(1);
  });

  it("menggunakan Heart Bet untuk bonus spark", () => {
    let state = createInitialPickOneState(5);

    state = submitPickOneAnswer(state, "host", "a", true);
    expect(state.betsRemaining.host).toBe(1);
    expect(state.roundBets.host).toBe(true);

    state = submitPickOneAnswer(state, "guest", "a");
    expect(state.sparkCount).toBe(2);
    expect(state.lastSparkAward).toBe(2);
  });

  it("memberi spark ganda pada ronde jackpot", () => {
    let state = {
      ...createInitialPickOneState(5),
      roundIndex: 3,
    };

    expect(isPowerRound(state.roundIndex)).toBe(true);

    state = submitPickOneAnswer(state, "host", "b");
    state = submitPickOneAnswer(state, "guest", "b");

    expect(state.sparkCount).toBe(2);
    expect(state.lastSparkAward).toBe(2);
  });

  it("memutus streak ketika jawaban berbeda", () => {
    let state = {
      ...createInitialPickOneState(5),
      currentStreak: 2,
      bestStreak: 2,
    };

    state = submitPickOneAnswer(state, "host", "a");
    state = submitPickOneAnswer(state, "guest", "b");

    expect(state.currentStreak).toBe(0);
    expect(state.bestStreak).toBe(2);
  });

  it("menolak pemain yang menjawab dua kali", () => {
    let state = createInitialPickOneState(5);

    state = submitPickOneAnswer(state, "host", "a");

    expect(() => {
      submitPickOneAnswer(state, "host", "b");
    }).toThrow("sudah menjawab");
  });

  it("melanjutkan ke ronde berikutnya", () => {
    let state = createInitialPickOneState(5);

    state = submitPickOneAnswer(state, "host", "a");
    state = submitPickOneAnswer(state, "guest", "a");
    state = continuePickOne(state);

    expect(state.roundIndex).toBe(1);
    expect(state.answers).toEqual({
      host: null,
      guest: null,
    });
  });
});
