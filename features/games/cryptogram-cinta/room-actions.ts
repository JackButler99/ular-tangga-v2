import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import {
  acknowledgeCryptogramLevel,
  createInitialCryptogramState,
  submitCryptogramGuess,
  type CryptogramState,
} from "@/features/games/cryptogram-cinta/engine";
import { parseCryptogramState } from "@/features/games/cryptogram-cinta/room-view";
import { CRYPTOGRAM_CINTA_SLUG } from "@/features/platform/game-registry";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

export type CryptogramRoomAction =
  | "cryptogram-guess"
  | "cryptogram-ready"
  | "cryptogram-restart";

const CRYPTOGRAM_ACTIONS: readonly CryptogramRoomAction[] = [
  "cryptogram-guess",
  "cryptogram-ready",
  "cryptogram-restart",
];

export function isCryptogramRoomAction(
  value: unknown,
): value is CryptogramRoomAction {
  return (
    typeof value === "string" &&
    CRYPTOGRAM_ACTIONS.includes(value as CryptogramRoomAction)
  );
}

function requireLetter(value: unknown) {
  if (typeof value !== "string" || !/^[A-Za-z]$/.test(value.trim())) {
    throw new Error("Huruf Cryptogram tidak valid.");
  }

  return value.trim().toUpperCase();
}

export async function applyCryptogramRoomAction(
  row: RoomRow,
  token: string,
  action: CryptogramRoomAction,
  payload: {
    cipherLetter?: unknown;
    plainLetter?: unknown;
  } = {},
) {
  if (row.gameSlug !== CRYPTOGRAM_CINTA_SLUG) {
    throw new Error("Room ini bukan room Cryptogram Cinta.");
  }

  const role = roleForToken(row, token);

  if (!role) {
    throw new Error(
      "Sesi pemain tidak dikenali. Buka kembali tautan undanganmu.",
    );
  }

  if (row.status === "waiting") {
    throw new Error("Tunggu pasanganmu bergabung dulu.");
  }

  let nextState: CryptogramState;

  if (action === "cryptogram-restart") {
    if (role !== "host") {
      throw new Error("Hanya pembuat room yang bisa memulai ulang.");
    }

    const currentState = parseCryptogramState(row.gameState);
    nextState = createInitialCryptogramState(
      undefined,
      currentState.language,
    );
  } else {
    if (row.status === "finished") {
      throw new Error("Permainan sudah selesai.");
    }

    const state = parseCryptogramState(row.gameState);

    if (action === "cryptogram-guess") {
      nextState = submitCryptogramGuess(
        state,
        role,
        requireLetter(payload.cipherLetter),
        requireLetter(payload.plainLetter),
      );
    } else {
      nextState = acknowledgeCryptogramLevel(state, role);
    }
  }

  const now = new Date().toISOString();
  const db = getDb();

  const [updated] = await db
    .update(gameRooms)
    .set({
      gameState: nextState,
      status: nextState.phase === "finished" ? "finished" : "active",
      updatedAt: now,
      version: sql`${gameRooms.version} + 1`,
    })
    .where(
      and(
        eq(gameRooms.code, row.code),
        eq(gameRooms.version, row.version),
      ),
    )
    .returning();

  if (!updated) {
    throw new Error(
      "Papan baru saja diperbarui pasanganmu. Coba lagi.",
    );
  }

  return updated;
}
