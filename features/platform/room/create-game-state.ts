import { createInitialQuizState } from "@/features/games/seberapa-kenal/engine";
import { createInitialMostLikelyState } from "@/features/games/siapa-yang-lebih/engine";
import {
  COUPLE_QUIZ_SLUG,
  MOST_LIKELY_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";

export function createInitialGameState(
  gameSlug: string,
  questionCount: QuestionCount =
    DEFAULT_QUESTION_COUNT,
): unknown {
  if (gameSlug === SNAKE_LADDER_SLUG) {
    return {};
  }

  if (gameSlug === COUPLE_QUIZ_SLUG) {
    return createInitialQuizState(questionCount);
  }

  if (gameSlug === MOST_LIKELY_SLUG) {
    return createInitialMostLikelyState(
      questionCount,
    );
  }

  throw new Error("Permainan tidak dikenali.");
}