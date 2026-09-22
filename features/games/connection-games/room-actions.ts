import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import { PICK_ONE_SLUG } from "@/features/platform/game-registry";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

import type { PickOneAnswer } from "./content";
import {
  continuePickOne,
  submitPickOneAnswer,
} from "./engine";
import { parseConnectionState } from "./room-view";

export const CONNECTION_ROOM_ACTIONS = [
  "pick-one-answer",
  "pick-one-continue",
] as const;

export type ConnectionRoomAction =
  (typeof CONNECTION_ROOM_ACTIONS)[number];

export type ConnectionActionPayload = {
  answer?: unknown;
  useBet?: unknown;
};

export function isConnectionRoomAction(
  value: unknown,
): value is ConnectionRoomAction {
  return (
    typeof value === "string" &&
    CONNECTION_ROOM_ACTIONS.some(
      (action) => action === value,
    )
  );
}

function isPickOneAnswer(
  value: unknown,
): value is PickOneAnswer {
  return value === "a" || value === "b";
}

export async function applyConnectionRoomAction(
  row: RoomRow,
  token: string | undefined,
  action: ConnectionRoomAction,
  payload: ConnectionActionPayload,
): Promise<RoomRow> {
  if (row.gameSlug !== PICK_ONE_SLUG) {
    throw new Error("Room bukan milik permainan Pilih Mana.");
  }

  const role = token ? roleForToken(row, token) : null;

  if (!role) {
    throw new Error("Token pemain tidak valid.");
  }

  if (row.status === "waiting") {
    throw new Error("Tunggu pasangan bergabung terlebih dahulu.");
  }

  if (row.status === "finished") {
    throw new Error("Permainan ini sudah selesai.");
  }

  const state = parseConnectionState(row.gameState);
  const nextState = (() => {
    if (action === "pick-one-answer") {
      if (!isPickOneAnswer(payload.answer)) {
        throw new Error("Pilihan tidak valid.");
      }

      if (
        payload.useBet !== undefined &&
        typeof payload.useBet !== "boolean"
      ) {
        throw new Error("Heart Bet tidak valid.");
      }

      return submitPickOneAnswer(
        state,
        role,
        payload.answer,
        payload.useBet ?? false,
      );
    }

    if (role !== "host") {
      throw new Error(
        "Hanya pembuat room yang bisa melanjutkan ronde.",
      );
    }

    return continuePickOne(state);
  })();

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
      version: sql`${gameRooms.version} + 1`,
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
