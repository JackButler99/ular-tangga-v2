import { PICK_ONE_SLUG } from "@/features/platform/game-registry";
import type {
  BaseRoomView,
  PlayerRole,
} from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

import {
  getPickOneRound,
  type PickOneAnswer,
} from "./content";
import {
  getCurrentPickOneRound,
  INITIAL_HEART_BETS,
  isPowerRound,
  type PickOnePhase,
  type PickOneState,
} from "./engine";

export type PickOneGameView = {
  kind: "pick-one";
  phase: PickOnePhase;
  round: number;
  totalRounds: number;
  prompt: ReturnType<typeof getCurrentPickOneRound>;
  yourAnswer: PickOneAnswer | null;
  answered: Record<PlayerRole, boolean>;
  revealedAnswers: Record<
    PlayerRole,
    PickOneAnswer | null
  > | null;
  yourBet: boolean;
  yourBetsRemaining: number;
  revealedBets: Record<PlayerRole, boolean> | null;
  matchCount: number;
  sparkCount: number;
  currentStreak: number;
  bestStreak: number;
  lastSparkAward: number;
  powerRound: boolean;
};

export type ConnectionRoomView = BaseRoomView & {
  players: {
    host: string;
    guest: string | null;
  };
  game: PickOneGameView;
};

function isPhase(value: unknown): value is PickOnePhase {
  return (
    value === "answering" ||
    value === "reveal" ||
    value === "finished"
  );
}

function isAnswer(
  value: unknown,
): value is PickOneAnswer | null {
  return value === null || value === "a" || value === "b";
}

function isNonNegativeInteger(value: unknown) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0
  );
}

function isAnswers(
  value: unknown,
): value is PickOneState["answers"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const answers = value as Record<string, unknown>;
  return isAnswer(answers.host) && isAnswer(answers.guest);
}

function isRoundBets(
  value: unknown,
): value is PickOneState["roundBets"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bets = value as Record<string, unknown>;
  return (
    typeof bets.host === "boolean" &&
    typeof bets.guest === "boolean"
  );
}

function isBetsRemaining(
  value: unknown,
): value is PickOneState["betsRemaining"] {
  if (!value || typeof value !== "object") {
    return false;
  }

  const bets = value as Record<string, unknown>;
  return (
    isNonNegativeInteger(bets.host) &&
    isNonNegativeInteger(bets.guest)
  );
}

function validateSharedState(
  state: Record<string, unknown>,
) {
  return (
    state.kind === "pick-one" &&
    Array.isArray(state.roundIds) &&
    state.roundIds.length > 0 &&
    state.roundIds.every((id) => typeof id === "string") &&
    isNonNegativeInteger(state.roundIndex) &&
    (state.roundIndex as number) < state.roundIds.length &&
    isPhase(state.phase) &&
    isAnswers(state.answers) &&
    isNonNegativeInteger(state.matchCount)
  );
}

export function parseConnectionState(
  value: unknown,
): PickOneState {
  if (!value || typeof value !== "object") {
    throw new Error("State Pilih Mana tidak valid.");
  }

  const state = value as Record<string, unknown>;

  if (!validateSharedState(state)) {
    throw new Error("State Pilih Mana tidak valid.");
  }

  if (state.schemaVersion === 1) {
    const legacy = state as unknown as {
      roundIds: string[];
      roundIndex: number;
      phase: PickOnePhase;
      answers: PickOneState["answers"];
      matchCount: number;
    };
    const lastRoundMatched =
      legacy.answers.host !== null &&
      legacy.answers.host === legacy.answers.guest;

    legacy.roundIds.forEach((id) => getPickOneRound(id));

    return {
      schemaVersion: 2,
      kind: "pick-one",
      roundIds: legacy.roundIds,
      roundIndex: legacy.roundIndex,
      phase: legacy.phase,
      answers: legacy.answers,
      roundBets: {
        host: false,
        guest: false,
      },
      betsRemaining: {
        host: INITIAL_HEART_BETS,
        guest: INITIAL_HEART_BETS,
      },
      matchCount: legacy.matchCount,
      sparkCount: legacy.matchCount,
      currentStreak: lastRoundMatched ? 1 : 0,
      bestStreak: lastRoundMatched ? 1 : 0,
      lastSparkAward: lastRoundMatched ? 1 : 0,
    };
  }

  if (
    state.schemaVersion !== 2 ||
    !isRoundBets(state.roundBets) ||
    !isBetsRemaining(state.betsRemaining) ||
    !isNonNegativeInteger(state.sparkCount) ||
    !isNonNegativeInteger(state.currentStreak) ||
    !isNonNegativeInteger(state.bestStreak) ||
    !isNonNegativeInteger(state.lastSparkAward)
  ) {
    throw new Error("State Pilih Mana tidak valid.");
  }

  const parsed = state as unknown as PickOneState;
  parsed.roundIds.forEach((id) => getPickOneRound(id));
  return parsed;
}

export function toConnectionRoomView(
  row: RoomRow,
  token?: string,
): ConnectionRoomView {
  if (row.gameSlug !== PICK_ONE_SLUG) {
    throw new Error("Room bukan milik permainan Pilih Mana.");
  }

  const state = parseConnectionState(row.gameState);
  const viewer = token ? roleForToken(row, token) : null;
  const revealed =
    state.phase === "reveal" || state.phase === "finished";

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    you: viewer,
    updatedAt: row.updatedAt,
    players: {
      host: row.hostName,
      guest: row.guestName,
    },
    game: {
      kind: "pick-one",
      phase: state.phase,
      round: state.roundIndex + 1,
      totalRounds: state.roundIds.length,
      prompt: getCurrentPickOneRound(state),
      yourAnswer: viewer ? state.answers[viewer] : null,
      answered: {
        host: state.answers.host !== null,
        guest: state.answers.guest !== null,
      },
      revealedAnswers: revealed ? state.answers : null,
      yourBet: viewer ? state.roundBets[viewer] : false,
      yourBetsRemaining: viewer
        ? state.betsRemaining[viewer]
        : 0,
      revealedBets: revealed ? state.roundBets : null,
      matchCount: state.matchCount,
      sparkCount: state.sparkCount,
      currentStreak: state.currentStreak,
      bestStreak: state.bestStreak,
      lastSparkAward: state.lastSparkAward,
      powerRound: isPowerRound(state.roundIndex),
    },
  };
}
