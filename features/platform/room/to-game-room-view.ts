import {
  toConnectionRoomView,
  type ConnectionRoomView,
} from "@/features/games/connection-games/room-view";
import {
  toLongingMazeRoomView,
  type LongingMazeRoomView,
} from "@/features/games/labirin-rindu/room-view";
import {
  toQuizRoomView,
  type QuizRoomView,
} from "@/features/games/seberapa-kenal/room-view";
import {
  toMostLikelyRoomView,
  type MostLikelyRoomView,
} from "@/features/games/siapa-yang-lebih/room-view";
import type { SnakeLadderRoomView } from "@/features/games/ular-tangga/game";
import {
  COUPLE_QUIZ_SLUG,
  isConnectionGameSlug,
  LONGING_MAZE_SLUG,
  MOST_LIKELY_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import {
  toRoomView as toSnakeLadderRoomView,
  type RoomRow,
} from "@/lib/rooms";

export type GameRoomView =
  | SnakeLadderRoomView
  | QuizRoomView
  | MostLikelyRoomView
  | ConnectionRoomView
  | LongingMazeRoomView;

export function toGameRoomView(
  row: RoomRow,
  token?: string,
): GameRoomView {
  if (row.gameSlug === SNAKE_LADDER_SLUG) {
    return toSnakeLadderRoomView(row, token);
  }

  if (row.gameSlug === COUPLE_QUIZ_SLUG) {
    return toQuizRoomView(row, token);
  }

  if (row.gameSlug === MOST_LIKELY_SLUG) {
    return toMostLikelyRoomView(row, token);
  }

  if (row.gameSlug === LONGING_MAZE_SLUG) {
    return toLongingMazeRoomView(row, token);
  }

  if (isConnectionGameSlug(row.gameSlug)) {
    return toConnectionRoomView(row, token);
  }

  throw new Error("Jenis permainan room tidak dikenali.");
}
