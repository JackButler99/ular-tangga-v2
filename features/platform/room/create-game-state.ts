import { createInitialQuizState } from "@/features/games/seberapa-kenal/engine";
import { createInitialMostLikelyState } from "@/features/games/siapa-yang-lebih/engine";
import {
  COUPLE_QUIZ_SLUG,
  MOST_LIKELY_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";

export function createInitialGameState(gameSlug: string): unknown {
  if (gameSlug === SNAKE_LADDER_SLUG) {
    return {};
  }

  if (gameSlug === COUPLE_QUIZ_SLUG) {
    return createInitialQuizState();
  }

  if (gameSlug === MOST_LIKELY_SLUG) {
    return createInitialMostLikelyState();
  }

  throw new Error("Permainan tidak dikenali.");
}