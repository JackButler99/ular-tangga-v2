import { and, eq, sql } from "drizzle-orm";

import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import { LONGING_MAZE_SLUG } from "@/features/platform/game-registry";
import { roleForToken, type RoomRow } from "@/lib/rooms";

import {
  chooseMazeSkill,
  MAZE_DIRECTIONS,
  planMazeRoute,
  protectInBoss,
  resolveMazeDanger,
  restartLongingMaze,
  useGuideSkill,
  walkMazeRoute,
  type MazeBossProtection,
  type MazeDirection,
} from "./engine";
import {
  isMazeSkillId,
  type MazeSkillId,
} from "./rpg-content";
import { parseLongingMazeState } from "./room-view";

export const LONGING_MAZE_ACTIONS = [
  "maze-plan-route",
  "maze-walk-route",
  "maze-choose-skill",
  "maze-use-skill",
  "maze-resolve-danger",
  "maze-boss-protect",
  "maze-restart",
] as const;

export type LongingMazeAction =
  (typeof LONGING_MAZE_ACTIONS)[number];

export type LongingMazeActionPayload = {
  directions?: unknown;
  trustSteps?: unknown;
  skillId?: unknown;
  protection?: unknown;
};

export function isLongingMazeAction(
  value: unknown,
): value is LongingMazeAction {
  return (
    typeof value === "string" &&
    LONGING_MAZE_ACTIONS.some((action) => action === value)
  );
}

function isDirection(value: unknown): value is MazeDirection {
  return (
    typeof value === "string" &&
    MAZE_DIRECTIONS.some((direction) => direction === value)
  );
}

function parseDirections(value: unknown): MazeDirection[] {
  if (
    !Array.isArray(value) ||
    value.length < 1 ||
    value.length > 3 ||
    !value.every(isDirection)
  ) {
    throw new Error("Rute harus berisi satu sampai tiga arah.");
  }
  return value;
}

function parseTrustSteps(value: unknown) {
  if (
    typeof value !== "number" ||
    !Number.isInteger(value) ||
    value < 1 ||
    value > 3
  ) {
    throw new Error("Jumlah langkah kepercayaan tidak valid.");
  }
  return value;
}

function parseOptionalSkill(value: unknown): MazeSkillId | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  if (!isMazeSkillId(value)) {
    throw new Error("Skill tidak valid.");
  }
  return value;
}

function parseProtection(value: unknown): MazeBossProtection {
  if (value === "bond" || value === "endure" || isMazeSkillId(value)) {
    return value;
  }
  throw new Error("Perlindungan boss tidak valid.");
}

export async function applyLongingMazeAction(
  row: RoomRow,
  token: string | undefined,
  action: LongingMazeAction,
  payload: LongingMazeActionPayload,
): Promise<RoomRow> {
  if (row.gameSlug !== LONGING_MAZE_SLUG) {
    throw new Error("Room bukan milik permainan Labirin Rindu.");
  }

  const role = token ? roleForToken(row, token) : null;
  if (!role) throw new Error("Token pemain tidak valid.");
  if (row.status === "waiting") {
    throw new Error("Tunggu pasangan bergabung terlebih dahulu.");
  }

  const state = parseLongingMazeState(row.gameState);
  const nextState = (() => {
    if (action === "maze-restart") {
      if (role !== "host") {
        throw new Error(
          "Hanya pembuat room yang dapat memulai labirin baru.",
        );
      }
      if (state.phase !== "won" && state.phase !== "lost") {
        throw new Error("Perjalanan ini masih berlangsung.");
      }
      return restartLongingMaze();
    }

    if (row.status === "finished") {
      throw new Error("Permainan ini sudah selesai.");
    }

    if (action === "maze-plan-route") {
      return planMazeRoute(
        state,
        role,
        parseDirections(payload.directions),
      );
    }
    if (action === "maze-walk-route") {
      return walkMazeRoute(
        state,
        role,
        parseTrustSteps(payload.trustSteps),
      );
    }
    if (action === "maze-choose-skill") {
      const skillId = parseOptionalSkill(payload.skillId);
      if (!skillId) throw new Error("Pilih satu skill.");
      return chooseMazeSkill(state, role, skillId);
    }
    if (action === "maze-use-skill") {
      const skillId = parseOptionalSkill(payload.skillId);
      if (!skillId) throw new Error("Pilih satu skill.");
      return useGuideSkill(state, role, skillId);
    }
    if (action === "maze-resolve-danger") {
      return resolveMazeDanger(
        state,
        role,
        parseOptionalSkill(payload.skillId),
      );
    }
    return protectInBoss(
      state,
      role,
      parseProtection(payload.protection),
    );
  })();

  const finished =
    nextState.phase === "won" || nextState.phase === "lost";
  const db = getDb();
  const [updatedRoom] = await db
    .update(gameRooms)
    .set({
      gameState: nextState,
      status: finished ? "finished" : "active",
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
    throw new Error("Labirin baru saja berubah. Silakan coba lagi.");
  }
  return updatedRoom;
}
