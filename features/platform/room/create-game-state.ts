import { createInitialQuizState } from "@/features/games/seberapa-kenal/engine";
import {
  COUPLE_QUIZ_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";

export function createInitialGameState(gameSlug: string): unknown {
  if (gameSlug === SNAKE_LADDER_SLUG) {
    return {};
  }

  if (gameSlug === COUPLE_QUIZ_SLUG) {
    return createInitialQuizState();
  }

  throw new Error("Permainan tidak dikenali.");
}