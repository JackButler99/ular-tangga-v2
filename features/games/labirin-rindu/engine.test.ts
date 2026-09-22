import { describe, expect, it } from "vitest";

import {
  bossAttackFor,
  chooseMazeSkill,
  createInitialLongingMazeState,
  generateMazeDefinition,
  getOpenDirections,
  mazePositionKey,
  planMazeRoute,
  protectInBoss,
  resolveMazeDanger,
  walkMazeRoute,
  type LongingMazeState,
  type MazeDirection,
  type MazePosition,
} from "./engine";
import { getMazeSkill } from "./rpg-content";

const DELTAS: Record<
  MazeDirection,
  { x: number; y: number; opposite: MazeDirection }
> = {
  up: { x: 0, y: -1, opposite: "down" },
  right: { x: 1, y: 0, opposite: "left" },
  down: { x: 0, y: 1, opposite: "up" },
  left: { x: -1, y: 0, opposite: "right" },
};

function movePosition(
  position: MazePosition,
  direction: MazeDirection,
) {
  const delta = DELTAS[direction];
  return { x: position.x + delta.x, y: position.y + delta.y };
}

function approachCell(
  base: LongingMazeState,
  cellId: string,
  actor: "host" | "guest" = "host",
) {
  const definition = generateMazeDefinition(base.seed);
  const targetValues = cellId.split(":").map(Number);
  const target = { x: targetValues[0], y: targetValues[1] };
  const outward = getOpenDirections(definition, target)[0];
  const neighbor = movePosition(target, outward);
  const direction = DELTAS[outward].opposite;
  return {
    prepared: {
      ...base,
      turn: actor,
      positions: {
        ...base.positions,
        [actor]: neighbor,
      },
    },
    direction,
  };
}

describe("Labirin Rindu RPG generation", () => {
  it("menghasilkan run deterministik lengkap dari seed", () => {
    const first = generateMazeDefinition(24051999);
    const second = generateMazeDefinition(24051999);

    expect(first).toEqual(second);
    expect(first.openings).toHaveLength(49);
    expect(first.altars).toHaveLength(12);
    expect(first.dangers).toHaveLength(6);
    expect(first.fragments.host).not.toBe(first.fragments.guest);
    expect(first.maxLight).toBeGreaterThan(first.optimalMoves);
  });

  it("menjaga seluruh petak tetap saling terhubung", () => {
    const definition = generateMazeDefinition(987654321);
    const queue: MazePosition[] = [{ x: 0, y: 0 }];
    const visited = new Set(["0:0"]);

    for (let index = 0; index < queue.length; index += 1) {
      const position = queue[index];
      for (const direction of getOpenDirections(definition, position)) {
        const next = movePosition(position, direction);
        const key = mazePositionKey(next);
        if (!visited.has(key)) {
          visited.add(key);
          queue.push(next);
        }
      }
    }

    expect(visited.size).toBe(49);
  });

  it("menjaga penempatan khusus valid pada banyak seed", () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const definition = generateMazeDefinition(seed * 7919);
      const specialIds = [
        definition.fragments.host,
        definition.fragments.guest,
        ...definition.altars.map((altar) => altar.cellId),
        ...definition.dangers.map((danger) => danger.cellId),
      ];

      expect(new Set(specialIds).size).toBe(specialIds.length);
      expect(
        definition.altars.every((altar) => altar.options.length === 3),
      ).toBe(true);
    }
  });
});

describe("Labirin Rindu RPG engine", () => {
  it("membuat dua penjaga dengan sumber daya awal", () => {
    const state = createInitialLongingMazeState(12345);
    const definition = generateMazeDefinition(state.seed);

    expect(state.phase).toBe("exploring");
    expect(state.positions).toEqual(definition.starts);
    expect(state.players.host.hearts).toBe(3);
    expect(state.players.guest.hearts).toBe(3);
    expect(state.light).toBe(definition.maxLight);
    expect(state.hunters).toHaveLength(2);
  });

  it("pemandu menyusun rute dan pejalan memilih tingkat percaya", () => {
    const state = createInitialLongingMazeState(12345);
    const definition = generateMazeDefinition(state.seed);
    const direction = getOpenDirections(
      definition,
      state.positions.host,
    )[0];
    const planned = planMazeRoute(state, "guest", [direction]);
    const walked = walkMazeRoute(planned, "host", 1);

    expect(planned.guidance?.directions).toEqual([direction]);
    expect(walked.positions.host).toEqual(
      movePosition(state.positions.host, direction),
    );
    expect(walked.movesUsed).toBe(1);
  });

  it("mengizinkan rute berisiko dan menghentikannya saat menabrak", () => {
    const state = createInitialLongingMazeState(12345);
    const definition = generateMazeDefinition(state.seed);
    const open = getOpenDirections(definition, state.positions.host);
    const closed = (["up", "right", "down", "left"] as const).find(
      (direction) => !open.includes(direction),
    );

    expect(closed).toBeDefined();
    const planned = planMazeRoute(state, "guest", [closed!, "up"]);
    const walked = walkMazeRoute(planned, "host", 2);

    expect(walked.positions.host).toEqual(state.positions.host);
    expect(walked.wallHits).toBe(1);
    expect(walked.movesUsed).toBe(1);
  });

  it("memberikan pilihan skill ketika menemukan altar", () => {
    const base = createInitialLongingMazeState(12345);
    const definition = generateMazeDefinition(base.seed);
    const altar = definition.altars[0];
    const { prepared, direction } = approachCell(base, altar.cellId);
    const planned = planMazeRoute(prepared, "guest", [direction]);
    const arrived = walkMazeRoute(planned, "host", 1);

    expect(arrived.phase).toBe("skill-choice");
    expect(arrived.pendingSkillChoice?.options).toEqual(altar.options);

    const chosen = chooseMazeSkill(arrived, "host", altar.options[0]);
    expect(chosen.phase).toBe("exploring");
    expect(chosen.players.host.skills).toContain(altar.options[0]);
    expect(chosen.claimedAltars).toContain(altar.cellId);
  });

  it("bahaya hanya dapat dilindungi oleh pasangan", () => {
    const base = createInitialLongingMazeState(54321);
    const definition = generateMazeDefinition(base.seed);
    const danger = definition.dangers[0];
    const { prepared, direction } = approachCell(base, danger.cellId);
    const planned = planMazeRoute(prepared, "guest", [direction]);
    const exposed = walkMazeRoute(planned, "host", 1);

    expect(exposed.phase).toBe("danger");
    expect(exposed.pendingDanger?.target).toBe("host");
    expect(() => resolveMazeDanger(exposed, "host")).toThrow(
      "Hanya pasangan",
    );

    const resolved = resolveMazeDanger(exposed, "guest");
    expect(resolved.phase).toBe("exploring");
    expect(resolved.resolvedDangers).toContain(danger.cellId);
  });

  it("skill counter mencegah akibat bahaya", () => {
    const base = createInitialLongingMazeState(77777);
    const prepared: LongingMazeState = {
      ...base,
      phase: "danger",
      players: {
        ...base.players,
        guest: {
          ...base.players.guest,
          skills: ["peluk-pelindung"],
        },
      },
      pendingDanger: {
        kind: "duri-sunyi",
        target: "host",
        source: "trap",
        cellId: "1:1",
        fallbackPosition: base.positions.host,
        resumeTurn: "guest",
        resumeRound: 2,
      },
    };
    const resolved = resolveMazeDanger(
      prepared,
      "guest",
      "peluk-pelindung",
    );

    expect(resolved.players.host.hearts).toBe(3);
    expect(resolved.damagePrevented).toBe(1);
    expect(resolved.players.guest.skills).toEqual([]);
  });

  it("boss menampilkan serangan berbeda dan menyelesaikan ronde ketiga", () => {
    const base = createInitialLongingMazeState(99999);
    const hostAttack = bossAttackFor(base.seed, 3, "guest");
    const guestAttack = bossAttackFor(base.seed, 3, "host");
    const hostSkill = (
      [
        "peluk-pelindung",
        "pegangan-erat",
        "bisikan-tenang",
        "janji-pulang",
      ] as const
    ).find((id) => getMazeSkill(id).counters.includes(hostAttack))!;
    const guestSkill = (
      [
        "peluk-pelindung",
        "pegangan-erat",
        "bisikan-tenang",
        "janji-pulang",
      ] as const
    ).find((id) => getMazeSkill(id).counters.includes(guestAttack))!;
    const boss: LongingMazeState = {
      ...base,
      phase: "boss",
      bossRound: 3,
      bond: 5,
      players: {
        host: { ...base.players.host, skills: [hostSkill] },
        guest: { ...base.players.guest, skills: [guestSkill] },
      },
    };
    const hostReady = protectInBoss(boss, "host", hostSkill);
    const won = protectInBoss(hostReady, "guest", guestSkill);

    expect(won.phase).toBe("won");
    expect(won.damagePrevented).toBe(2);
  });
});
