import type { PlayerRole } from "@/features/platform/room/types";

import {
  getMostLikelyQuestion,
  MOST_LIKELY_QUESTIONS,
} from "./questions";

export type MostLikelyPhase = "answering" | "reveal" | "finished";

export type MostLikelyAnswers = Record<
  PlayerRole,
  PlayerRole | null
>;

export type MostLikelyState = {
  schemaVersion: 1;
  questionIds: string[];
  roundIndex: number;
  phase: MostLikelyPhase;
  answers: MostLikelyAnswers;
  agreementCount: number;
};

function shuffle<T>(items: readonly T[]): T[] {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

export function createInitialMostLikelyState(): MostLikelyState {
  return {
    schemaVersion: 1,
    questionIds: shuffle(MOST_LIKELY_QUESTIONS)
      .slice(0, 6)
      .map((question) => question.id),
    roundIndex: 0,
    phase: "answering",
    answers: {
      host: null,
      guest: null,
    },
    agreementCount: 0,
  };
}

export function getCurrentMostLikelyQuestion(
  state: MostLikelyState,
) {
  const questionId = state.questionIds[state.roundIndex];

  if (!questionId) {
    return null;
  }

  return getMostLikelyQuestion(questionId);
}

export function submitMostLikelyAnswer(
  state: MostLikelyState,
  actor: PlayerRole,
  answer: PlayerRole,
): MostLikelyState {
  if (state.phase !== "answering") {
    throw new Error("Ronde ini tidak sedang menerima jawaban.");
  }

  if (state.answers[actor] !== null) {
    throw new Error("Kamu sudah menjawab ronde ini.");
  }

  if (answer !== "host" && answer !== "guest") {
    throw new Error("Jawaban tidak valid.");
  }

  const answers: MostLikelyAnswers = {
    ...state.answers,
    [actor]: answer,
  };

  const bothAnswered =
    answers.host !== null && answers.guest !== null;

  const agreed =
    bothAnswered && answers.host === answers.guest;

  return {
    ...state,
    answers,
    phase: bothAnswered ? "reveal" : "answering",
    agreementCount:
      state.agreementCount + (agreed ? 1 : 0),
  };
}

export function continueMostLikely(
  state: MostLikelyState,
): MostLikelyState {
  if (state.phase !== "reveal") {
    throw new Error("Hasil ronde belum dapat dilanjutkan.");
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
    phase: "answering",
    answers: {
      host: null,
      guest: null,
    },
  };
}