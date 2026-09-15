import type { SnakeLadderRoomView } from "@/features/games/ular-tangga/game";
import {
  toQuizRoomView,
  type QuizRoomView,
} from "@/features/games/seberapa-kenal/room-view";
import {
  COUPLE_QUIZ_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import {
  toRoomView as toSnakeLadderRoomView,
  type RoomRow,
} from "@/lib/rooms";

export type GameRoomView =
  | SnakeLadderRoomView
  | QuizRoomView;

export function toGameRoomView(
  row: RoomRow,
  token = "",
): GameRoomView {
  if (row.gameSlug === SNAKE_LADDER_SLUG) {
    return toSnakeLadderRoomView(row, token);
  }

  if (row.gameSlug === COUPLE_QUIZ_SLUG) {
    return toQuizRoomView(row, token);
  }

  throw new Error("Permainan room tidak dikenali.");
}