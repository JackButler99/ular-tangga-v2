import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import {
  continueMostLikely,
  submitMostLikelyAnswer,
  type MostLikelyState,
} from "@/features/games/siapa-yang-lebih/engine";
import { parseMostLikelyState } from "@/features/games/siapa-yang-lebih/room-view";
import { MOST_LIKELY_SLUG } from "@/features/platform/game-registry";
import type { PlayerRole } from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

export const MOST_LIKELY_ROOM_ACTIONS = [
  "most-likely-answer",
  "most-likely-continue",
] as const;

export type MostLikelyRoomAction =
  (typeof MOST_LIKELY_ROOM_ACTIONS)[number];

export function isMostLikelyRoomAction(
  value: unknown,
): value is MostLikelyRoomAction {
  return (
    typeof value === "string" &&
    MOST_LIKELY_ROOM_ACTIONS.some(
      (action) => action === value,
    )
  );
}

function isPlayerRole(value: unknown): value is PlayerRole {
  return value === "host" || value === "guest";
}

export async function applyMostLikelyRoomAction(
  row: RoomRow,
  token: string | undefined,
  action: MostLikelyRoomAction,
  answer?: unknown,
): Promise<RoomRow> {
  if (row.gameSlug !== MOST_LIKELY_SLUG) {
    throw new Error("Room bukan milik permainan ini.");
  }

  const role = token
    ? roleForToken(row, token)
    : null;

  if (!role) {
    throw new Error("Token pemain tidak valid.");
  }

  if (row.status !== "active") {
    if (row.status === "waiting") {
      throw new Error(
        "Tunggu pasangan bergabung terlebih dahulu.",
      );
    }

    throw new Error("Permainan ini sudah selesai.");
  }

  const state = parseMostLikelyState(row.gameState);
  let nextState: MostLikelyState;

  if (action === "most-likely-answer") {
    if (!isPlayerRole(answer)) {
      throw new Error("Jawaban tidak valid.");
    }

    nextState = submitMostLikelyAnswer(
      state,
      role,
      answer,
    );
  } else {
    if (role !== "host") {
      throw new Error(
        "Hanya pembuat room yang bisa melanjutkan ronde.",
      );
    }

    nextState = continueMostLikely(state);
  }

  const db = getDb();

  const [updatedRoom] = await db
    .update(gameRooms)
    .set({
      gameState: nextState,
      status:
        nextState.phase === "finished"
          ? "finished"
          : "active",
      updatedAt: new Date().toISOString(),
      version: row.version + 1,
    })
    .where(
      and(
        eq(gameRooms.code, row.code),
        eq(gameRooms.version, row.version),
      ),
    )
    .returning();

  if (!updatedRoom) {
    throw new Error(
      "Room baru saja berubah. Silakan coba lagi.",
    );
  }

  return updatedRoom;
}