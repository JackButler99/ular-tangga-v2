import {
  getCurrentQuizQuestion,
  otherPlayer,
  type QuizPhase,
  type QuizState,
} from "@/features/games/seberapa-kenal/engine";
import type {
  BaseRoomView,
  PlayerRole,
} from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

const VALID_PHASES: readonly QuizPhase[] = [
  "subject-answer",
  "guesser-answer",
  "reveal",
  "finished",
];

export type QuizRoomView = BaseRoomView & {
  players: {
    host: {
      name: string;
    };
    guest: {
      name: string;
    } | null;
  };
  quiz: {
    phase: QuizPhase;
    roundIndex: number;
    roundCount: number;
    subject: PlayerRole;
    question: ReturnType<typeof getCurrentQuizQuestion>;
    subjectAnswer: number | null;
    guessAnswer: number | null;
    matched: boolean | null;
    scores: Record<PlayerRole, number>;
  };
};

function isStoredAnswer(value: unknown) {
  return value === null || Number.isInteger(value);
}

export function parseQuizState(value: unknown): QuizState {
  if (!value || typeof value !== "object") {
    throw new Error("State quiz tidak valid.");
  }

  const state = value as Partial<QuizState>;

  if (state.schemaVersion !== 1) {
    throw new Error("Versi state quiz tidak didukung.");
  }

  if (
    !Array.isArray(state.questionIds) ||
    state.questionIds.length === 0 ||
    state.questionIds.some((id) => typeof id !== "string")
  ) {
    throw new Error("Daftar pertanyaan quiz tidak valid.");
  }

  if (
    typeof state.roundIndex !== "number" ||
    !Number.isInteger(state.roundIndex) ||
    state.roundIndex < 0 ||
    state.roundIndex >= state.questionIds.length
  ) {
    throw new Error("Ronde quiz tidak valid.");
  }

  if (state.subject !== "host" && state.subject !== "guest") {
    throw new Error("Pemain quiz tidak valid.");
  }

  if (
    typeof state.phase !== "string" ||
    !VALID_PHASES.includes(state.phase as QuizPhase)
  ) {
    throw new Error("Fase quiz tidak valid.");
  }

  if (
    !isStoredAnswer(state.subjectAnswer) ||
    !isStoredAnswer(state.guessAnswer)
  ) {
    throw new Error("Jawaban quiz tidak valid.");
  }

  if (
    !state.scores ||
    !Number.isInteger(state.scores.host) ||
    !Number.isInteger(state.scores.guest)
  ) {
    throw new Error("Skor quiz tidak valid.");
  }

  const validState = state as QuizState;

  // Memastikan ID pertanyaan ronde ini benar-benar tersedia.
  getCurrentQuizQuestion(validState);

  return validState;
}

export function toQuizRoomView(
  row: RoomRow,
  token = "",
): QuizRoomView {
  const state = parseQuizState(row.gameState);
  const viewer = roleForToken(row, token);
  const guesser = otherPlayer(state.subject);
  const canReveal =
    state.phase === "reveal" || state.phase === "finished";

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    you: viewer,
    updatedAt: row.updatedAt,
    players: {
      host: {
        name: row.hostName,
      },
      guest: row.guestName
        ? {
            name: row.guestName,
          }
        : null,
    },
    quiz: {
      phase: state.phase,
      roundIndex: state.roundIndex,
      roundCount: state.questionIds.length,
      subject: state.subject,
      question: getCurrentQuizQuestion(state),
      subjectAnswer:
        canReveal || viewer === state.subject
          ? state.subjectAnswer
          : null,
      guessAnswer:
        canReveal || viewer === guesser
          ? state.guessAnswer
          : null,
      matched:
        canReveal &&
        state.subjectAnswer !== null &&
        state.guessAnswer !== null
          ? state.subjectAnswer === state.guessAnswer
          : null,
      scores: state.scores,
    },
  };
}