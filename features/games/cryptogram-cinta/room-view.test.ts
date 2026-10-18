import { describe, expect, it } from "vitest";

import { CRYPTOGRAM_CINTA_SLUG } from "@/features/platform/game-registry";
import type { RoomRow } from "@/lib/rooms";

import {
  createInitialCryptogramState,
  getCryptogramPuzzle,
  knownMappings,
  submitCryptogramGuess,
  type CryptogramState,
} from "./engine";
import {
  parseCryptogramState,
  toCryptogramRoomView,
} from "./room-view";

function roomRow(state?: CryptogramState): RoomRow {
  return {
    code: "CIPHER88",
    gameSlug: CRYPTOGRAM_CINTA_SLUG,
    gameState: state ?? createInitialCryptogramState(12345),
    hostName: "Ara",
    hostToken: "host-token",
    guestName: "Bima",
    guestToken: "guest-token",
    hostPosition: 1,
    guestPosition: 1,
    turn: "host",
    status: "active",
    winner: null,
    lastRoll: null,
    challenge: null,
    history: "[]",
    version: 0,
    createdAt: "2026-10-18T00:00:00.000Z",
    updatedAt: "2026-10-18T00:00:00.000Z",
  };
}

describe("Cryptogram Cinta room view", () => {
  it("menyembunyikan kutipan asli selama puzzle dimainkan", () => {
    const state = createInitialCryptogramState(12345, "en");
    const view = toCryptogramRoomView(roomRow(state), "host-token");

    expect(view.you).toBe("host");
    expect(view.cryptogram.language).toBe("en");
    expect(view.cryptogram.quote).toBeNull();
    expect(view.cryptogram.cipherText).not.toBe(
      getCryptogramPuzzle(state).quote.text,
    );
  });

  it("membagikan tebakan benar kepada kedua pemain", () => {
    const state = createInitialCryptogramState(54321);
    const puzzle = getCryptogramPuzzle(state);
    const cipherLetter = puzzle.cipherLetters.find(
      (letter) => !knownMappings(state)[letter],
    )!;
    const guessed = submitCryptogramGuess(
      state,
      "host",
      cipherLetter,
      puzzle.solutionByCipher[cipherLetter],
    );
    const row = roomRow(guessed);

    expect(
      toCryptogramRoomView(row, "host-token").cryptogram.knownMappings,
    ).toEqual(
      toCryptogramRoomView(row, "guest-token").cryptogram.knownMappings,
    );
  });

  it("menampilkan jawaban setelah permainan berakhir", () => {
    const state: CryptogramState = {
      ...createInitialCryptogramState(24680),
      phase: "finished",
    };
    const view = toCryptogramRoomView(roomRow(state), "guest-token");

    expect(view.cryptogram.quote?.text).toBe(
      getCryptogramPuzzle(state).quote.text,
    );
  });

  it("menolak state dengan versi asing", () => {
    expect(() =>
      parseCryptogramState({
        schemaVersion: 99,
      }),
    ).toThrow("Versi state Cryptogram");
  });
});
