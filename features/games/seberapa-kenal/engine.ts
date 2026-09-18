import type { PlayerRole } from "@/features/platform/room/types";
import {
  DEFAULT_QUESTION_COUNT,
  selectQuestionIds,
  type QuestionCount,
} from "@/features/platform/question-count";

import {
  getQuizQuestion,
  QUIZ_QUESTIONS,
  type QuizQuestion,
} from "./questions";

export type QuizPhase =
  | "subject-answer"
  | "guesser-answer"
  | "reveal"
  | "finished";

export type QuizScores = Record<PlayerRole, number>;

export type QuizState = {
  schemaVersion: 1;
  questionIds: string[];
  roundIndex: number;
  subject: PlayerRole;
  phase: QuizPhase;
  subjectAnswer: number | null;
  guessAnswer: number | null;
  scores: QuizScores;
};

export function otherPlayer(
  role: PlayerRole,
): PlayerRole {
  return role === "host" ? "guest" : "host";
}

export function createInitialQuizState(
  questionCount: QuestionCount =
    DEFAULT_QUESTION_COUNT,
): QuizState {
  return {
    schemaVersion: 1,
    questionIds: selectQuestionIds(
      QUIZ_QUESTIONS,
      questionCount,
    ),
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

export function getCurrentQuizQuestion(
  state: QuizState,
): QuizQuestion {
  const questionId =
    state.questionIds[state.roundIndex];

  if (!questionId) {
    throw new Error("Ronde kuis tidak valid.");
  }

  return getQuizQuestion(questionId);
}

export function validateAnswer(
  question: QuizQuestion,
  answerIndex: number,
) {
  return (
    Number.isInteger(answerIndex) &&
    answerIndex >= 0 &&
    answerIndex < question.options.length
  );
}

export function submitSubjectAnswer(
  state: QuizState,
  role: PlayerRole,
  answerIndex: number,
): QuizState {
  if (state.phase !== "subject-answer") {
    throw new Error(
      "Kuis tidak sedang menerima jawaban utama.",
    );
  }

  if (role !== state.subject) {
    throw new Error(
      "Giliran pasanganmu memilih jawaban.",
    );
  }

  const question = getCurrentQuizQuestion(state);

  if (!validateAnswer(question, answerIndex)) {
    throw new Error("Jawaban tidak valid.");
  }

  return {
    ...state,
    phase: "guesser-answer",
    subjectAnswer: answerIndex,
    guessAnswer: null,
  };
}

export function submitGuess(
  state: QuizState,
  role: PlayerRole,
  answerIndex: number,
): QuizState {
  if (state.phase !== "guesser-answer") {
    throw new Error(
      "Kuis tidak sedang menerima tebakan.",
    );
  }

  const guesser = otherPlayer(state.subject);

  if (role !== guesser) {
    throw new Error(
      "Belum giliranmu memberikan tebakan.",
    );
  }

  const question = getCurrentQuizQuestion(state);

  if (!validateAnswer(question, answerIndex)) {
    throw new Error("Tebakan tidak valid.");
  }

  if (state.subjectAnswer === null) {
    throw new Error("Jawaban utama belum tersedia.");
  }

  const matched =
    state.subjectAnswer === answerIndex;

  const scores: QuizScores = {
    ...state.scores,
  };

  if (matched) {
    scores[guesser] += 1;
  }

  return {
    ...state,
    phase: "reveal",
    guessAnswer: answerIndex,
    scores,
  };
}

export function continueQuiz(
  state: QuizState,
): QuizState {
  if (state.phase !== "reveal") {
    throw new Error(
      "Hasil ronde belum dapat dilanjutkan.",
    );
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