import { describe, expect, it } from "vitest";

import { CRYPTOGRAM_QUOTES } from "./content";
import {
  acknowledgeCryptogramLevel,
  createInitialCryptogramState,
  difficultyForLevel,
  getCryptogramPuzzle,
  knownMappings,
  submitCryptogramGuess,
  type CryptogramState,
} from "./engine";

function solveLevel(initial: CryptogramState) {
  let state = initial;
  const puzzle = getCryptogramPuzzle(state);

  for (const cipherLetter of puzzle.cipherLetters) {
    if (knownMappings(state)[cipherLetter]) continue;
    state = submitCryptogramGuess(
      state,
      "host",
      cipherLetter,
      puzzle.solutionByCipher[cipherLetter],
    );
  }

  return state;
}

describe("Cryptogram Cinta engine", () => {
  it("menghasilkan puzzle deterministik tanpa membocorkan huruf asli", () => {
    const state = createInitialCryptogramState(20261018);
    const first = getCryptogramPuzzle(state);
    const second = getCryptogramPuzzle(state);

    expect(first).toEqual(second);
    expect(first.cipherText).not.toBe(first.quote.text);
    expect(first.cipherLetters.length).toBeGreaterThan(5);
  });

  it("memakai bank kutipan asli sesuai bahasa room", () => {
    const indonesian = createInitialCryptogramState(
      20261018,
      "id",
    );
    const english = createInitialCryptogramState(
      20261018,
      "en",
    );

    expect(getCryptogramPuzzle(indonesian).quote.language).toBe("id");
    expect(getCryptogramPuzzle(english).quote.language).toBe("en");
    expect(
      new Set(CRYPTOGRAM_QUOTES.map((quote) => quote.id)).size,
    ).toBe(CRYPTOGRAM_QUOTES.length);
    for (const language of ["id", "en"] as const) {
      const languageQuotes = CRYPTOGRAM_QUOTES.filter(
        (quote) => quote.language === language,
      );

      expect(languageQuotes).toHaveLength(32);
      for (const tier of [1, 2, 3, 4] as const) {
        expect(
          languageQuotes.filter((quote) => quote.tier === tier),
        ).toHaveLength(8);
      }
    }
    expect(
      CRYPTOGRAM_QUOTES.every(
        (quote) =>
          quote.source.length > 0 &&
          quote.referenceUrl.startsWith("https://") &&
          (quote.kind === "literature" ||
            quote.kind === "pop-culture"),
      ),
    ).toBe(true);
  });

  it("menaikkan tingkat kesulitan sesuai level", () => {
    expect(difficultyForLevel(1).id).toBe("easy");
    expect(difficultyForLevel(3).id).toBe("medium");
    expect(difficultyForLevel(6).id).toBe("hard");
    expect(difficultyForLevel(9).id).toBe("legend");
    expect(difficultyForLevel(12).maxMistakes).toBe(4);
  });

  it("menggabungkan kontribusi kedua pemain pada papan yang sama", () => {
    const initial = createInitialCryptogramState(12345);
    const puzzle = getCryptogramPuzzle(initial);
    const unsolved = puzzle.cipherLetters.filter(
      (letter) => !knownMappings(initial)[letter],
    );
    const hostMove = submitCryptogramGuess(
      initial,
      "host",
      unsolved[0],
      puzzle.solutionByCipher[unsolved[0]],
    );
    const guestMove = submitCryptogramGuess(
      hostMove,
      "guest",
      unsolved[1],
      puzzle.solutionByCipher[unsolved[1]],
    );

    expect(guestMove.guesses[unsolved[0]]).toBeDefined();
    expect(guestMove.guesses[unsolved[1]]).toBeDefined();
    expect(guestMove.contributions).toEqual({
      host: 1,
      guest: 1,
    });
  });

  it("mengurangi hati bersama untuk tebakan salah hingga permainan usai", () => {
    let state = createInitialCryptogramState(98765);
    const puzzle = getCryptogramPuzzle(state);
    const cipherLetter = puzzle.cipherLetters.find(
      (letter) => !knownMappings(state)[letter],
    )!;
    const correct = puzzle.solutionByCipher[cipherLetter];
    const usedLetters = Object.values(knownMappings(state));
    const wrong = Array.from("ABCDEFGHIJKLMNOPQRSTUVWXYZ").find(
      (letter) => letter !== correct && !usedLetters.includes(letter),
    )!;

    for (
      let attempt = 0;
      attempt < puzzle.difficulty.maxMistakes;
      attempt += 1
    ) {
      state = submitCryptogramGuess(
        state,
        "guest",
        cipherLetter,
        wrong,
      );
    }

    expect(state.phase).toBe("finished");
    expect(state.mistakes).toBe(puzzle.difficulty.maxMistakes);
    expect(state.solvedLevels).toBe(0);
  });

  it("menunggu kedua pemain menutup cutscene sebelum membuka level baru", () => {
    const completed = solveLevel(
      createInitialCryptogramState(54321),
    );

    expect(completed.phase).toBe("level-complete");
    expect(completed.solvedLevels).toBe(1);

    const hostReady = acknowledgeCryptogramLevel(
      completed,
      "host",
    );
    expect(hostReady.phase).toBe("level-complete");
    expect(hostReady.readyPlayers).toEqual(["host"]);

    const nextLevel = acknowledgeCryptogramLevel(
      hostReady,
      "guest",
    );
    expect(nextLevel.phase).toBe("playing");
    expect(nextLevel.level).toBe(2);
    expect(nextLevel.mistakes).toBe(0);
    expect(nextLevel.guesses).toEqual({});
  });
});
