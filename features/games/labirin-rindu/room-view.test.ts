import { describe, expect, it } from "vitest";

import { LONGING_MAZE_SLUG } from "@/features/platform/game-registry";
import type { RoomRow } from "@/lib/rooms";

import {
  createInitialLongingMazeState,
  generateMazeDefinition,
  getOpenDirections,
  type LongingMazeState,
} from "./engine";
import {
  parseLongingMazeState,
  toLongingMazeRoomView,
} from "./room-view";

function roomRow(state?: LongingMazeState): RoomRow {
  return {
    code: "MAZE1234",
    gameSlug: LONGING_MAZE_SLUG,
    gameState: state ?? createInitialLongingMazeState(12345),
    hostName: "Ara",
    hostToken: "host-token",
    guestName: "Bima",
    guestToken: "guest-token",
    hostPosition: 1,
    guestPosition: 1,
    turn: "host",
    status: "active",
    winner: null,
    lastRoll: null,
    challenge: null,
    history: "[]",
    version: 0,
    createdAt: "2026-09-21T00:00:00.000Z",
    updatedAt: "2026-09-21T00:00:00.000Z",
  };
}

describe("Labirin Rindu RPG room view", () => {
  it("memberikan peta pejalan hanya kepada pasangannya", () => {
    const row = roomRow();
    const state = parseLongingMazeState(row.gameState);
    const definition = generateMazeDefinition(state.seed);
    const hostView = toLongingMazeRoomView(row, "host-token");
    const guestView = toLongingMazeRoomView(row, "guest-token");
    const hostCellForHost = hostView.game.cells.find(
      (cell) =>
        cell.x === state.positions.host.x &&
        cell.y === state.positions.host.y,
    );
    const hostCellForGuest = guestView.game.cells.find(
      (cell) =>
        cell.x === state.positions.host.x &&
        cell.y === state.positions.host.y,
    );

    expect(hostCellForHost?.openings).toEqual(
      getOpenDirections(definition, state.positions.host),
    );
    expect(hostCellForGuest?.openings).toEqual(
      getOpenDirections(definition, state.positions.host),
    );
    expect(hostView.game.canWalkRoute).toBe(false);
    expect(guestView.game.canPlanRoute).toBe(true);
  });

  it("menyembunyikan identitas bahaya dari target", () => {
    const base = createInitialLongingMazeState(12345);
    const dangerState: LongingMazeState = {
      ...base,
      phase: "danger",
      pendingDanger: {
        kind: "duri-sunyi",
        target: "host",
        source: "trap",
        cellId: "1:1",
        fallbackPosition: base.positions.host,
        resumeTurn: "guest",
        resumeRound: 2,
      },
      players: {
        ...base.players,
        guest: {
          ...base.players.guest,
          skills: ["peluk-pelindung"],
        },
      },
    };
    const row = roomRow(dangerState);
    const targetView = toLongingMazeRoomView(row, "host-token");
    const guardianView = toLongingMazeRoomView(row, "guest-token");

    expect(targetView.game.pendingDanger?.danger).toBeNull();
    expect(targetView.game.pendingDanger?.canProtect).toBe(false);
    expect(guardianView.game.pendingDanger?.danger?.id).toBe(
      "duri-sunyi",
    );
    expect(guardianView.game.pendingDanger?.usableSkillIds).toContain(
      "peluk-pelindung",
    );
  });

  it("hanya mengirim inventory milik penonton", () => {
    const base = createInitialLongingMazeState(12345);
    const state: LongingMazeState = {
      ...base,
      players: {
        host: {
          ...base.players.host,
          skills: ["mata-hati"],
        },
        guest: {
          ...base.players.guest,
          skills: ["peluk-pelindung"],
        },
      },
    };
    const row = roomRow(state);

    expect(
      toLongingMazeRoomView(row, "host-token").game.inventory.map(
        (skill) => skill.id,
      ),
    ).toEqual(["mata-hati"]);
    expect(
      toLongingMazeRoomView(row, "guest-token").game.inventory.map(
        (skill) => skill.id,
      ),
    ).toEqual(["peluk-pelindung"]);
  });

  it("tidak membocorkan peta kepada pengunjung tanpa token", () => {
    const view = toLongingMazeRoomView(roomRow());

    expect(
      view.game.cells.every((cell) => cell.openings === null),
    ).toBe(true);
    expect(view.game.inventory).toEqual([]);
  });

  it("memberi pesan khusus untuk room versi lama", () => {
    expect(() =>
      parseLongingMazeState({
        kind: "longing-maze",
        schemaVersion: 1,
      }),
    ).toThrow("versi Labirin lama");
  });
});
