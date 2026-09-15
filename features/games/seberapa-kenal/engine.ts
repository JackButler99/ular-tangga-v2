import type { PlayerRole } from "@/features/platform/room/types";
import {
  getQuizQuestion,
  QUIZ_QUESTIONS,
} from "@/features/games/seberapa-kenal/questions";

export type QuizPhase =
  | "subject-answer"
  | "guesser-answer"
  | "reveal"
  | "finished";

export type QuizState = {
  questionIds: string[];
  roundIndex: number;
  subject: PlayerRole;
  phase: QuizPhase;
  subjectAnswer: number | null;
  guessAnswer: number | null;
  scores: Record<PlayerRole, number>;
};

const DEFAULT_ROUND_COUNT = 6;

export function otherPlayer(role: PlayerRole): PlayerRole {
  return role === "host" ? "guest" : "host";
}

export function createInitialQuizState(
  questionIds: readonly string[] = QUIZ_QUESTIONS
    .slice(0, DEFAULT_ROUND_COUNT)
    .map((question) => question.id),
): QuizState {
  if (questionIds.length === 0) {
    throw new Error("Permainan membutuhkan minimal satu pertanyaan.");
  }

  questionIds.forEach(getQuizQuestion);

  return {
    questionIds: [...questionIds],
    roundIndex: 0,
    subject: "host",
    phase: "subject-answer",
    subjectAnswer: null,
    guessAnswer: null,
    scores: {
      host: 0,
      guest: 0,
    },
  };
}

export function getCurrentQuizQuestion(state: QuizState) {
  const questionId = state.questionIds[state.roundIndex];

  if (!questionId) {
    throw new Error("Ronde permainan tidak valid.");
  }

  return getQuizQuestion(questionId);
}

function validateAnswer(state: QuizState, answerIndex: number) {
  const question = getCurrentQuizQuestion(state);

  if (
    !Number.isInteger(answerIndex) ||
    answerIndex < 0 ||
    answerIndex >= question.options.length
  ) {
    throw new Error("Pilihan jawaban tidak valid.");
  }
}

export function submitSubjectAnswer(
  state: QuizState,
  role: PlayerRole,
  answerIndex: number,
): QuizState {
  if (state.phase !== "subject-answer") {
    throw new Error("Jawaban asli sudah diberikan.");
  }

  if (role !== state.subject) {
    throw new Error("Saat ini pasanganmu yang harus menjawab.");
  }

  validateAnswer(state, answerIndex);

  return {
    ...state,
    phase: "guesser-answer",
    subjectAnswer: answerIndex,
  };
}

export function submitGuess(
  state: QuizState,
  role: PlayerRole,
  answerIndex: number,
): QuizState {
  if (state.phase !== "guesser-answer") {
    throw new Error("Belum waktunya memberikan tebakan.");
  }

  const guesser = otherPlayer(state.subject);

  if (role !== guesser) {
    throw new Error("Kamu tidak dapat menebak jawabanmu sendiri.");
  }

  validateAnswer(state, answerIndex);

  const matched = state.subjectAnswer === answerIndex;

  return {
    ...state,
    phase: "reveal",
    guessAnswer: answerIndex,
    scores: {
      ...state.scores,
      [role]: state.scores[role] + (matched ? 1 : 0),
    },
  };
}

export function continueQuiz(state: QuizState): QuizState {
  if (state.phase !== "reveal") {
    throw new Error("Jawaban belum bisa dilanjutkan.");
  }

  const nextRoundIndex = state.roundIndex + 1;

  if (nextRoundIndex >= state.questionIds.length) {
    return {
      ...state,
      phase: "finished",
    };
  }

  return {
    ...state,
    roundIndex: nextRoundIndex,
    subject: otherPlayer(state.subject),
    phase: "subject-answer",
    subjectAnswer: null,
    guessAnswer: null,
  };
}