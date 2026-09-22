import { describe, expect, it } from "vitest";

import { PICK_ONE_ROUNDS } from "./content";
import { parseConnectionState } from "./room-view";

describe("Pilih Mana room state", () => {
  it("memigrasikan room versi lama tanpa memutus permainan", () => {
    const state = parseConnectionState({
      schemaVersion: 1,
      kind: "pick-one",
      roundIds: [PICK_ONE_ROUNDS[0].id],
      roundIndex: 0,
      phase: "answering",
      answers: {
        host: null,
        guest: null,
      },
      matchCount: 0,
    });

    expect(state.schemaVersion).toBe(2);
    expect(state.betsRemaining).toEqual({
      host: 2,
      guest: 2,
    });
    expect(state.sparkCount).toBe(0);
  });

  it("menolak jumlah Heart Bet yang tidak valid", () => {
    expect(() =>
      parseConnectionState({
        schemaVersion: 2,
        kind: "pick-one",
        roundIds: [PICK_ONE_ROUNDS[0].id],
        roundIndex: 0,
        phase: "answering",
        answers: {
          host: null,
          guest: null,
        },
        roundBets: {
          host: false,
          guest: false,
        },
        betsRemaining: {
          host: -1,
          guest: 2,
        },
        matchCount: 0,
        sparkCount: 0,
        currentStreak: 0,
        bestStreak: 0,
        lastSparkAward: 0,
      }),
    ).toThrow("tidak valid");
  });
});
