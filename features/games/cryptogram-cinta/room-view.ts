import {
  getCryptogramPuzzle,
  knownMappings,
  type CryptogramEvent,
  type CryptogramPhase,
  type CryptogramState,
} from "@/features/games/cryptogram-cinta/engine";
import {
  isCryptogramLanguage,
  type CryptogramLanguage,
} from "@/features/games/cryptogram-cinta/content";
import type {
  BaseRoomView,
  PlayerRole,
} from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

const VALID_PHASES: readonly CryptogramPhase[] = [
  "playing",
  "level-complete",
  "finished",
];

const VALID_ROLES: readonly PlayerRole[] = ["host", "guest"];

export type CryptogramRoomView = BaseRoomView & {
  players: {
    host: { name: string };
    guest: { name: string } | null;
  };
  cryptogram: {
    language: CryptogramLanguage;
    phase: CryptogramPhase;
    level: number;
    solvedLevels: number;
    cipherText: string;
    cipherLetters: string[];
    knownMappings: Record<string, string>;
    progress: number;
    mistakes: number;
    remainingMistakes: number;
    difficulty: {
      id: "easy" | "medium" | "hard" | "legend";
      label: string;
      maxMistakes: number;
      revealedLetters: number;
    };
    quote: {
      text: string;
      source: string;
      referenceUrl: string;
      kind: "literature" | "pop-culture";
    } | null;
    contributions: Record<PlayerRole, number>;
    readyPlayers: PlayerRole[];
    lastEvent: CryptogramEvent | null;
  };
};

function isLetterRecord(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([cipherLetter, plainLetter]) =>
      /^[A-Z]$/.test(cipherLetter) &&
      typeof plainLetter === "string" &&
      /^[A-Z]$/.test(plainLetter),
  );
}

function isCryptogramEvent(value: unknown): value is CryptogramEvent {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;

  const event = value as Partial<CryptogramEvent>;
  return (
    (event.kind === "correct" ||
      event.kind === "wrong" ||
      event.kind === "level-complete" ||
      event.kind === "game-over") &&
    (event.role === "host" || event.role === "guest") &&
    typeof event.cipherLetter === "string" &&
    /^[A-Z]$/.test(event.cipherLetter) &&
    typeof event.plainLetter === "string" &&
    /^[A-Z]$/.test(event.plainLetter)
  );
}

export function parseCryptogramState(value: unknown): CryptogramState {
  if (!value || typeof value !== "object") {
    throw new Error("State Cryptogram tidak valid.");
  }

  const state = value as Partial<CryptogramState>;

  if (state.schemaVersion !== 2) {
    throw new Error("Versi state Cryptogram tidak didukung.");
  }

  if (!isCryptogramLanguage(state.language)) {
    throw new Error("Bahasa kutipan Cryptogram tidak valid.");
  }

  if (
    !Number.isInteger(state.seed) ||
    !Number.isInteger(state.level) ||
    (state.level ?? 0) < 1 ||
    !Number.isInteger(state.solvedLevels) ||
    (state.solvedLevels ?? -1) < 0 ||
    !Number.isInteger(state.mistakes) ||
    (state.mistakes ?? -1) < 0
  ) {
    throw new Error("Progress Cryptogram tidak valid.");
  }

  if (
    typeof state.phase !== "string" ||
    !VALID_PHASES.includes(state.phase as CryptogramPhase)
  ) {
    throw new Error("Fase Cryptogram tidak valid.");
  }

  if (!isLetterRecord(state.guesses)) {
    throw new Error("Tebakan Cryptogram tidak valid.");
  }

  if (
    !Array.isArray(state.revealedCipherLetters) ||
    state.revealedCipherLetters.some(
      (letter) => typeof letter !== "string" || !/^[A-Z]$/.test(letter),
    )
  ) {
    throw new Error("Petunjuk Cryptogram tidak valid.");
  }

  if (
    !state.contributions ||
    !Number.isInteger(state.contributions.host) ||
    !Number.isInteger(state.contributions.guest) ||
    state.contributions.host < 0 ||
    state.contributions.guest < 0
  ) {
    throw new Error("Kontribusi pemain tidak valid.");
  }

  if (
    !Array.isArray(state.readyPlayers) ||
    state.readyPlayers.some(
      (role) => !VALID_ROLES.includes(role as PlayerRole),
    )
  ) {
    throw new Error("Status cutscene tidak valid.");
  }

  if (!isCryptogramEvent(state.lastEvent)) {
    throw new Error("Riwayat tebakan tidak valid.");
  }

  const validState = state as CryptogramState;
  const puzzle = getCryptogramPuzzle(validState);

  if (
    validState.mistakes > puzzle.difficulty.maxMistakes ||
    validState.revealedCipherLetters.some(
      (letter) => !puzzle.cipherLetters.includes(letter),
    )
  ) {
    throw new Error("Isi state Cryptogram tidak konsisten.");
  }

  return validState;
}

export function toCryptogramRoomView(
  row: RoomRow,
  token = "",
): CryptogramRoomView {
  const state = parseCryptogramState(row.gameState);
  const viewer = roleForToken(row, token);
  const puzzle = getCryptogramPuzzle(state);
  const mappings = knownMappings(state);
  const solvedCount = puzzle.cipherLetters.filter(
    (letter) => Boolean(mappings[letter]),
  ).length;
  const revealQuote = state.phase !== "playing";

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    you: viewer,
    updatedAt: row.updatedAt,
    players: {
      host: { name: row.hostName },
      guest: row.guestName ? { name: row.guestName } : null,
    },
    cryptogram: {
      language: state.language,
      phase: state.phase,
      level: state.level,
      solvedLevels: state.solvedLevels,
      cipherText: puzzle.cipherText,
      cipherLetters: puzzle.cipherLetters,
      knownMappings: mappings,
      progress: Math.round(
        (solvedCount / puzzle.cipherLetters.length) * 100,
      ),
      mistakes: state.mistakes,
      remainingMistakes:
        puzzle.difficulty.maxMistakes - state.mistakes,
      difficulty: {
        id: puzzle.difficulty.id,
        label: puzzle.difficulty.label,
        maxMistakes: puzzle.difficulty.maxMistakes,
        revealedLetters: puzzle.difficulty.revealedLetters,
      },
      quote: revealQuote
        ? {
            text: puzzle.quote.text,
            source: puzzle.quote.source,
            referenceUrl: puzzle.quote.referenceUrl,
            kind: puzzle.quote.kind,
          }
        : null,
      contributions: state.contributions,
      readyPlayers: state.readyPlayers,
      lastEvent: state.lastEvent,
    },
  };
}
