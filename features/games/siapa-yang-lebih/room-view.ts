import {
  getCurrentMostLikelyQuestion,
  type MostLikelyPhase,
  type MostLikelyState,
} from "./engine";

import { MOST_LIKELY_SLUG } from "@/features/platform/game-registry";
import type {
  BaseRoomView,
  PlayerRole,
} from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

export type MostLikelyRoomView = BaseRoomView & {
  players: {
    host: string;
    guest: string | null;
  };
  game: {
    round: number;
    totalRounds: number;
    phase: MostLikelyPhase;
    question: {
      id: string;
      text: string;
    } | null;
    yourAnswer: PlayerRole | null;
    partnerAnswered: boolean;
    revealedAnswers: {
      host: PlayerRole | null;
      guest: PlayerRole | null;
    } | null;
    agreementCount: number;
  };
};

function isPlayerRole(value: unknown): value is PlayerRole {
  return value === "host" || value === "guest";
}

function isAnswer(value: unknown): value is PlayerRole | null {
  return value === null || isPlayerRole(value);
}

function isPhase(value: unknown): value is MostLikelyPhase {
  return (
    value === "answering" ||
    value === "reveal" ||
    value === "finished"
  );
}

export function parseMostLikelyState(
  value: unknown,
): MostLikelyState {
  if (!value || typeof value !== "object") {
    throw new Error("State permainan tidak valid.");
  }

  const state = value as {
    schemaVersion?: unknown;
    questionIds?: unknown;
    roundIndex?: unknown;
    phase?: unknown;
    answers?: {
      host?: unknown;
      guest?: unknown;
    };
    agreementCount?: unknown;
  };

  if (state.schemaVersion !== 1) {
    throw new Error("Versi state permainan tidak didukung.");
  }

  if (
    !Array.isArray(state.questionIds) ||
    state.questionIds.length === 0 ||
    !state.questionIds.every(
      (questionId) => typeof questionId === "string",
    )
  ) {
    throw new Error("Daftar pertanyaan tidak valid.");
  }

  if (
    typeof state.roundIndex !== "number" ||
    !Number.isInteger(state.roundIndex) ||
    state.roundIndex < 0 ||
    state.roundIndex >= state.questionIds.length
  ) {
    throw new Error("Ronde permainan tidak valid.");
  }

  if (!isPhase(state.phase)) {
    throw new Error("Fase permainan tidak valid.");
  }

  if (
    !state.answers ||
    !isAnswer(state.answers.host) ||
    !isAnswer(state.answers.guest)
  ) {
    throw new Error("Jawaban permainan tidak valid.");
  }

  if (
    typeof state.agreementCount !== "number" ||
    !Number.isInteger(state.agreementCount) ||
    state.agreementCount < 0
  ) {
    throw new Error("Jumlah kecocokan tidak valid.");
  }

  return value as MostLikelyState;
}

export function toMostLikelyRoomView(
  row: RoomRow,
  token?: string,
): MostLikelyRoomView {
  if (row.gameSlug !== MOST_LIKELY_SLUG) {
    throw new Error("Room bukan milik permainan ini.");
  }

  const you = token ? roleForToken(row, token) : null;
  const state = parseMostLikelyState(row.gameState);
  const question = getCurrentMostLikelyQuestion(state);

  const partner: PlayerRole | null =
    you === "host"
      ? "guest"
      : you === "guest"
        ? "host"
        : null;

  const revealed =
    state.phase === "reveal" || state.phase === "finished";

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    you,
    updatedAt: row.updatedAt,
    players: {
      host: row.hostName,
      guest: row.guestName,
    },
    game: {
      round: state.roundIndex + 1,
      totalRounds: state.questionIds.length,
      phase: state.phase,
      question,
      yourAnswer: you ? state.answers[you] : null,
      partnerAnswered: partner
        ? state.answers[partner] !== null
        : false,
      revealedAnswers: revealed
        ? {
            host: state.answers.host,
            guest: state.answers.guest,
          }
        : null,
      agreementCount: state.agreementCount,
    },
  };
}