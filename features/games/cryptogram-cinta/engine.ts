import type { PlayerRole } from "@/features/platform/room/types";

import {
  CRYPTOGRAM_QUOTES,
  DEFAULT_CRYPTOGRAM_LANGUAGE,
  type CryptogramLanguage,
  type CryptogramQuote,
} from "./content";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export type CryptogramPhase =
  | "playing"
  | "level-complete"
  | "finished";

export type CryptogramDifficulty = {
  id: "easy" | "medium" | "hard" | "legend";
  label: string;
  tier: 1 | 2 | 3 | 4;
  revealedLetters: number;
  maxMistakes: number;
};

export type CryptogramEvent = {
  kind: "correct" | "wrong" | "level-complete" | "game-over";
  role: PlayerRole;
  cipherLetter: string;
  plainLetter: string;
};

export type CryptogramState = {
  schemaVersion: 2;
  language: CryptogramLanguage;
  seed: number;
  level: number;
  phase: CryptogramPhase;
  guesses: Record<string, string>;
  revealedCipherLetters: string[];
  mistakes: number;
  solvedLevels: number;
  contributions: Record<PlayerRole, number>;
  readyPlayers: PlayerRole[];
  lastEvent: CryptogramEvent | null;
};

export type CryptogramPuzzle = {
  quote: CryptogramQuote;
  difficulty: CryptogramDifficulty;
  cipherText: string;
  cipherLetters: string[];
  solutionByCipher: Record<string, string>;
};

const DIFFICULTIES: readonly CryptogramDifficulty[] = [
  {
    id: "easy",
    label: "Mudah",
    tier: 1,
    revealedLetters: 4,
    maxMistakes: 7,
  },
  {
    id: "medium",
    label: "Sedang",
    tier: 2,
    revealedLetters: 3,
    maxMistakes: 6,
  },
  {
    id: "hard",
    label: "Sulit",
    tier: 3,
    revealedLetters: 1,
    maxMistakes: 5,
  },
  {
    id: "legend",
    label: "Legenda",
    tier: 4,
    revealedLetters: 0,
    maxMistakes: 4,
  },
];

function normalizeSeed(value: number) {
  const normalized = value >>> 0;
  return normalized === 0 ? 1 : normalized;
}

function randomSeed() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return normalizeSeed(values[0]);
}

function mixSeed(seed: number, salt: number) {
  let value = normalizeSeed(seed ^ Math.imul(salt + 1, 0x9e3779b1));
  value ^= value >>> 16;
  value = Math.imul(value, 0x7feb352d);
  value ^= value >>> 15;
  value = Math.imul(value, 0x846ca68b);
  value ^= value >>> 16;
  return normalizeSeed(value);
}

function seededRandom(seed: number) {
  let value = normalizeSeed(seed);

  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^= result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(values: readonly T[], seed: number) {
  const result = [...values];
  const random = seededRandom(seed);

  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }

  return result;
}

export function difficultyForLevel(level: number): CryptogramDifficulty {
  if (level <= 2) return DIFFICULTIES[0];
  if (level <= 5) return DIFFICULTIES[1];
  if (level <= 8) return DIFFICULTIES[2];
  return DIFFICULTIES[3];
}

function quoteForLevel(
  seed: number,
  level: number,
  language: CryptogramLanguage,
) {
  const difficulty = difficultyForLevel(level);
  const pool = CRYPTOGRAM_QUOTES.filter(
    (quote) =>
      quote.language === language &&
      quote.tier === difficulty.tier,
  );
  const tierStart = difficulty.tier === 1
    ? 1
    : difficulty.tier === 2
      ? 3
      : difficulty.tier === 3
        ? 6
        : 9;
  const offset = Math.max(0, level - tierStart);
  const cycle = Math.floor(offset / pool.length);
  const order = shuffled(
    pool,
    mixSeed(seed, difficulty.tier * 1009 + cycle),
  );

  return order[offset % order.length];
}

function substitutionAlphabet(
  seed: number,
  level: number,
  difficulty: CryptogramDifficulty,
) {
  if (difficulty.id === "easy") {
    const shift = (mixSeed(seed, level) % 25) + 1;
    return Array.from(
      ALPHABET,
      (_, index) => ALPHABET[(index + shift) % ALPHABET.length],
    );
  }

  const result = shuffled(
    Array.from(ALPHABET),
    mixSeed(seed, level * 7919),
  );

  for (let index = 0; index < result.length; index += 1) {
    if (result[index] !== ALPHABET[index]) continue;
    const target = (index + 1) % result.length;
    [result[index], result[target]] = [result[target], result[index]];
  }

  return result;
}

export function getCryptogramPuzzle(
  state: Pick<CryptogramState, "seed" | "level" | "language">,
): CryptogramPuzzle {
  const difficulty = difficultyForLevel(state.level);
  const quote = quoteForLevel(
    state.seed,
    state.level,
    state.language,
  );
  const cipherAlphabet = substitutionAlphabet(
    state.seed,
    state.level,
    difficulty,
  );
  const solutionByCipher: Record<string, string> = {};

  for (let index = 0; index < ALPHABET.length; index += 1) {
    solutionByCipher[cipherAlphabet[index]] = ALPHABET[index];
  }

  const cipherText = quote.text
    .toUpperCase()
    .replace(
      /[A-Z]/g,
      (letter) => cipherAlphabet[ALPHABET.indexOf(letter)],
    );
  const cipherLetters = Array.from(
    new Set(cipherText.match(/[A-Z]/g) ?? []),
  );

  return {
    quote,
    difficulty,
    cipherText,
    cipherLetters,
    solutionByCipher,
  };
}

function revealedLettersForLevel(
  seed: number,
  level: number,
  language: CryptogramLanguage,
) {
  const puzzle = getCryptogramPuzzle({ seed, level, language });
  const frequencies = new Map<string, number>();

  for (const letter of puzzle.cipherText.match(/[A-Z]/g) ?? []) {
    frequencies.set(letter, (frequencies.get(letter) ?? 0) + 1);
  }

  return shuffled(
    puzzle.cipherLetters,
    mixSeed(seed, level * 3571),
  )
    .sort(
      (first, second) =>
        (frequencies.get(second) ?? 0) -
        (frequencies.get(first) ?? 0),
    )
    .slice(0, puzzle.difficulty.revealedLetters);
}

export function createInitialCryptogramState(
  seed = randomSeed(),
  language: CryptogramLanguage = DEFAULT_CRYPTOGRAM_LANGUAGE,
): CryptogramState {
  const normalizedSeed = normalizeSeed(seed);

  return {
    schemaVersion: 2,
    language,
    seed: normalizedSeed,
    level: 1,
    phase: "playing",
    guesses: {},
    revealedCipherLetters: revealedLettersForLevel(
      normalizedSeed,
      1,
      language,
    ),
    mistakes: 0,
    solvedLevels: 0,
    contributions: {
      host: 0,
      guest: 0,
    },
    readyPlayers: [],
    lastEvent: null,
  };
}

export function knownMappings(state: CryptogramState) {
  const puzzle = getCryptogramPuzzle(state);
  const revealed = Object.fromEntries(
    state.revealedCipherLetters.map((cipherLetter) => [
      cipherLetter,
      puzzle.solutionByCipher[cipherLetter],
    ]),
  );

  return {
    ...revealed,
    ...state.guesses,
  };
}

function normalizeLetter(value: string) {
  return value.trim().toUpperCase();
}

export function submitCryptogramGuess(
  state: CryptogramState,
  role: PlayerRole,
  cipherValue: string,
  plainValue: string,
): CryptogramState {
  if (state.phase !== "playing") {
    throw new Error("Level ini tidak sedang menerima tebakan.");
  }

  const cipherLetter = normalizeLetter(cipherValue);
  const plainLetter = normalizeLetter(plainValue);

  if (
    cipherLetter.length !== 1 ||
    plainLetter.length !== 1 ||
    !ALPHABET.includes(cipherLetter) ||
    !ALPHABET.includes(plainLetter)
  ) {
    throw new Error("Pilih satu huruf sandi dan satu huruf jawaban.");
  }

  const puzzle = getCryptogramPuzzle(state);

  if (!puzzle.cipherLetters.includes(cipherLetter)) {
    throw new Error("Huruf sandi itu tidak ada dalam kutipan.");
  }

  const mappings = knownMappings(state);

  if (mappings[cipherLetter]) {
    throw new Error("Huruf sandi itu sudah terpecahkan.");
  }

  if (Object.values(mappings).includes(plainLetter)) {
    throw new Error("Huruf jawaban itu sudah digunakan.");
  }

  const correct = puzzle.solutionByCipher[cipherLetter] === plainLetter;

  if (!correct) {
    const mistakes = state.mistakes + 1;
    const finished = mistakes >= puzzle.difficulty.maxMistakes;

    return {
      ...state,
      mistakes,
      phase: finished ? "finished" : "playing",
      lastEvent: {
        kind: finished ? "game-over" : "wrong",
        role,
        cipherLetter,
        plainLetter,
      },
    };
  }

  const guesses = {
    ...state.guesses,
    [cipherLetter]: plainLetter,
  };
  const nextMappings = {
    ...mappings,
    [cipherLetter]: plainLetter,
  };
  const completed = puzzle.cipherLetters.every(
    (letter) => Boolean(nextMappings[letter]),
  );

  return {
    ...state,
    guesses,
    phase: completed ? "level-complete" : "playing",
    solvedLevels: completed ? state.level : state.solvedLevels,
    contributions: {
      ...state.contributions,
      [role]: state.contributions[role] + 1,
    },
    readyPlayers: completed ? [] : state.readyPlayers,
    lastEvent: {
      kind: completed ? "level-complete" : "correct",
      role,
      cipherLetter,
      plainLetter,
    },
  };
}

function startNextLevel(state: CryptogramState): CryptogramState {
  const level = state.level + 1;

  return {
    ...state,
    level,
    phase: "playing",
    guesses: {},
    revealedCipherLetters: revealedLettersForLevel(
      state.seed,
      level,
      state.language,
    ),
    mistakes: 0,
    readyPlayers: [],
    lastEvent: null,
  };
}

export function acknowledgeCryptogramLevel(
  state: CryptogramState,
  role: PlayerRole,
) {
  if (state.phase !== "level-complete") {
    throw new Error("Level belum selesai.");
  }

  const readyPlayers = Array.from(
    new Set([...state.readyPlayers, role]),
  );

  if (readyPlayers.length === 2) {
    return startNextLevel({
      ...state,
      readyPlayers,
    });
  }

  return {
    ...state,
    readyPlayers,
  };
}
