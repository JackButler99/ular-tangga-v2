import type { PlayerRole } from "@/features/platform/room/types";

import {
  MAZE_DANGER_KINDS,
  MAZE_SKILL_IDS,
  getMazeSkill,
  type MazeDangerKind,
  type MazeSkillId,
} from "./rpg-content";

export const MAZE_SIZE = 7;
export const MAZE_SCHEMA_VERSION = 3;
export const MAX_MAZE_HEARTS = 3;
export const MAX_MAZE_BOND = 5;
export const MAX_MAZE_BOND_CAPACITY = 9;
export const MAX_MAZE_SKILLS = 4;

export type MazeDirection = "up" | "right" | "down" | "left";

export const MAZE_DIRECTIONS: readonly MazeDirection[] = [
  "up",
  "right",
  "down",
  "left",
] as const;

export type MazePosition = { x: number; y: number };

export type MazePhase =
  | "exploring"
  | "skill-choice"
  | "danger"
  | "boss"
  | "won"
  | "lost";

export type MazeRoute = {
  from: PlayerRole;
  to: PlayerRole;
  directions: MazeDirection[];
  round: number;
};

export type MazeHistoryItem = {
  kind:
    | "start"
    | "route"
    | "move"
    | "wall"
    | "skill"
    | "danger"
    | "fragment"
    | "reunion"
    | "hunter"
    | "boss"
    | "won"
    | "lost";
  actor: PlayerRole | null;
  message: string;
  dangerResolution?: MazeDangerResolution;
};

export type MazeDangerResolution = {
  danger: MazeDangerKind;
  target: PlayerRole;
  protector: PlayerRole;
  skillId: MazeSkillId | null;
  prevented: boolean;
};

export type MazePlayerState = {
  hearts: number;
  fragment: boolean;
  skills: MazeSkillId[];
};

export type MazeHunterState = {
  id: string;
  target: PlayerRole;
  position: MazePosition;
};

export type PendingMazeDanger = {
  kind: MazeDangerKind;
  target: PlayerRole;
  source: "trap" | "hunter";
  cellId: string;
  fallbackPosition: MazePosition;
  resumeTurn: PlayerRole;
  resumeRound: number;
};

export type PendingMazeSkillChoice = {
  role: PlayerRole;
  cellId: string;
  options: MazeSkillId[];
  resumeTurn: PlayerRole;
  resumeRound: number;
};

export type MazeBossProtection = MazeSkillId | "bond" | "endure";

export type LongingMazeState = {
  schemaVersion: typeof MAZE_SCHEMA_VERSION;
  kind: "longing-maze";
  seed: number;
  phase: MazePhase;
  turn: PlayerRole;
  round: number;
  positions: Record<PlayerRole, MazePosition>;
  players: Record<PlayerRole, MazePlayerState>;
  light: number;
  bond: number;
  maxBond: number;
  reunionRewardClaimed: boolean;
  movesUsed: number;
  wallHits: number;
  routesSent: number;
  damagePrevented: number;
  skillsUsed: number;
  guidance: MazeRoute | null;
  explored: Record<PlayerRole, string[]>;
  collectedFragments: string[];
  claimedAltars: string[];
  resolvedDangers: string[];
  pendingDanger: PendingMazeDanger | null;
  pendingSkillChoice: PendingMazeSkillChoice | null;
  hunters: MazeHunterState[];
  foresightUntil: Record<PlayerRole, number>;
  selfSightUntil: Record<PlayerRole, number>;
  lastSkillRound: Record<PlayerRole, number>;
  bossRound: number;
  bossChoices: Partial<Record<PlayerRole, MazeBossProtection>>;
  history: MazeHistoryItem[];
};

export type MazeAltar = {
  cellId: string;
  options: MazeSkillId[];
};

export type MazeDangerCell = {
  cellId: string;
  kind: Exclude<MazeDangerKind, "bayangan-sepi">;
};

export type MazeDefinition = {
  size: number;
  openings: number[];
  starts: Record<PlayerRole, MazePosition>;
  meeting: MazePosition;
  fragments: Record<PlayerRole, string>;
  altars: MazeAltar[];
  dangers: MazeDangerCell[];
  hunterSpawns: Record<PlayerRole, MazePosition>;
  optimalMoves: number;
  maxLight: number;
};

type DirectionDefinition = {
  direction: MazeDirection;
  dx: number;
  dy: number;
  bit: number;
  oppositeBit: number;
};

const DIRECTION_DEFINITIONS: readonly DirectionDefinition[] = [
  { direction: "up", dx: 0, dy: -1, bit: 1, oppositeBit: 4 },
  { direction: "right", dx: 1, dy: 0, bit: 2, oppositeBit: 8 },
  { direction: "down", dx: 0, dy: 1, bit: 4, oppositeBit: 1 },
  { direction: "left", dx: -1, dy: 0, bit: 8, oppositeBit: 2 },
] as const;

const DIRECTION_BY_NAME = new Map(
  DIRECTION_DEFINITIONS.map((entry) => [entry.direction, entry]),
);

const STARTS: Record<PlayerRole, MazePosition> = {
  host: { x: 0, y: MAZE_SIZE - 1 },
  guest: { x: MAZE_SIZE - 1, y: 0 },
};

const MEETING: MazePosition = {
  x: Math.floor(MAZE_SIZE / 2),
  y: Math.floor(MAZE_SIZE / 2),
};

function normalizeSeed(seed: number) {
  const normalized = seed >>> 0;
  return normalized === 0 ? 1 : normalized;
}

function createRandom(seed: number) {
  let value = normalizeSeed(seed);
  return () => {
    value += 0x6d2b79f5;
    let result = value;
    result = Math.imul(result ^ (result >>> 15), result | 1);
    result ^=
      result + Math.imul(result ^ (result >>> 7), result | 61);
    return ((result ^ (result >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffled<T>(items: readonly T[], random: () => number) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(random() * (index + 1));
    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }
  return result;
}

export function mazePositionKey(position: MazePosition) {
  return `${position.x}:${position.y}`;
}

export function positionFromMazeKey(cellId: string): MazePosition {
  const [x, y] = cellId.split(":").map(Number);
  return { x, y };
}

export function sameMazePosition(
  first: MazePosition,
  second: MazePosition,
) {
  return first.x === second.x && first.y === second.y;
}

function indexFor(position: MazePosition) {
  return position.y * MAZE_SIZE + position.x;
}

function positionFor(index: number): MazePosition {
  return {
    x: index % MAZE_SIZE,
    y: Math.floor(index / MAZE_SIZE),
  };
}

function insideMaze(position: MazePosition) {
  return (
    position.x >= 0 &&
    position.x < MAZE_SIZE &&
    position.y >= 0 &&
    position.y < MAZE_SIZE
  );
}

function connectCells(
  openings: number[],
  from: MazePosition,
  direction: DirectionDefinition,
) {
  const to = {
    x: from.x + direction.dx,
    y: from.y + direction.dy,
  };
  openings[indexFor(from)] |= direction.bit;
  openings[indexFor(to)] |= direction.oppositeBit;
}

function generateOpenings(seed: number) {
  const random = createRandom(seed);
  const cellCount = MAZE_SIZE * MAZE_SIZE;
  const openings = Array<number>(cellCount).fill(0);
  const visited = Array<boolean>(cellCount).fill(false);
  const stack = [Math.floor(random() * cellCount)];
  visited[stack[0]] = true;

  while (stack.length > 0) {
    const currentIndex = stack[stack.length - 1];
    const current = positionFor(currentIndex);
    const options = DIRECTION_DEFINITIONS.filter((direction) => {
      const next = {
        x: current.x + direction.dx,
        y: current.y + direction.dy,
      };
      return insideMaze(next) && !visited[indexFor(next)];
    });

    if (options.length === 0) {
      stack.pop();
      continue;
    }

    const direction = options[Math.floor(random() * options.length)];
    const next = {
      x: current.x + direction.dx,
      y: current.y + direction.dy,
    };
    connectCells(openings, current, direction);
    visited[indexFor(next)] = true;
    stack.push(indexFor(next));
  }

  const closedConnections: Array<{
    from: MazePosition;
    direction: DirectionDefinition;
  }> = [];
  for (let y = 0; y < MAZE_SIZE; y += 1) {
    for (let x = 0; x < MAZE_SIZE; x += 1) {
      const from = { x, y };
      for (const direction of DIRECTION_DEFINITIONS.slice(1, 3)) {
        const to = { x: x + direction.dx, y: y + direction.dy };
        if (
          insideMaze(to) &&
          (openings[indexFor(from)] & direction.bit) === 0
        ) {
          closedConnections.push({ from, direction });
        }
      }
    }
  }

  for (const connection of shuffled(closedConnections, random).slice(0, 2)) {
    connectCells(openings, connection.from, connection.direction);
  }
  return openings;
}

export function getOpenDirections(
  definition: MazeDefinition,
  position: MazePosition,
) {
  const mask = definition.openings[indexFor(position)] ?? 0;
  return DIRECTION_DEFINITIONS.filter(
    (direction) => (mask & direction.bit) !== 0,
  ).map((direction) => direction.direction);
}

function shortestPath(
  openings: readonly number[],
  start: MazePosition,
  goal: MazePosition,
) {
  const startIndex = indexFor(start);
  const goalIndex = indexFor(goal);
  const queue = [startIndex];
  const previous = new Map<number, number | null>([[startIndex, null]]);

  for (let pointer = 0; pointer < queue.length; pointer += 1) {
    const currentIndex = queue[pointer];
    if (currentIndex === goalIndex) break;
    const current = positionFor(currentIndex);
    const mask = openings[currentIndex] ?? 0;
    for (const direction of DIRECTION_DEFINITIONS) {
      if ((mask & direction.bit) === 0) continue;
      const next = {
        x: current.x + direction.dx,
        y: current.y + direction.dy,
      };
      const nextIndex = indexFor(next);
      if (!previous.has(nextIndex)) {
        previous.set(nextIndex, currentIndex);
        queue.push(nextIndex);
      }
    }
  }

  if (!previous.has(goalIndex)) {
    throw new Error("Labirin tidak memiliki jalan menuju tujuan.");
  }
  const path: MazePosition[] = [];
  let cursor: number | null = goalIndex;
  while (cursor !== null) {
    path.push(positionFor(cursor));
    cursor = previous.get(cursor) ?? null;
  }
  return path.reverse();
}

function pathDistance(
  openings: readonly number[],
  start: MazePosition,
  goal: MazePosition,
) {
  return shortestPath(openings, start, goal).length - 1;
}

function allPositions() {
  return Array.from({ length: MAZE_SIZE * MAZE_SIZE }, (_, index) =>
    positionFor(index),
  );
}

function chooseFragment(
  openings: readonly number[],
  role: PlayerRole,
  excluded: Set<string>,
  random: () => number,
) {
  const start = STARTS[role];
  const preferred = shuffled(allPositions(), random)
    .filter((position) => {
      const key = mazePositionKey(position);
      if (excluded.has(key)) return false;
      if (pathDistance(openings, start, position) < 3) return false;
      if (pathDistance(openings, position, MEETING) < 2) return false;
      return role === "host"
        ? position.y >= Math.floor(MAZE_SIZE / 2)
        : position.y <= Math.ceil(MAZE_SIZE / 2);
    })
    .sort((first, second) => {
      const firstScore =
        pathDistance(openings, start, first) +
        pathDistance(openings, first, MEETING);
      const secondScore =
        pathDistance(openings, start, second) +
        pathDistance(openings, second, MEETING);
      return secondScore - firstScore;
    });
  const selected = preferred[0];
  if (!selected) throw new Error("Fragmen Hati tidak dapat ditempatkan.");
  excluded.add(mazePositionKey(selected));
  return selected;
}

export function generateMazeDefinition(rawSeed: number): MazeDefinition {
  const seed = normalizeSeed(rawSeed);
  const openings = generateOpenings(seed);
  const random = createRandom(seed ^ 0xa5a5a5a5);
  const excluded = new Set([
    mazePositionKey(STARTS.host),
    mazePositionKey(STARTS.guest),
    mazePositionKey(MEETING),
  ]);
  const hostFragment = chooseFragment(
    openings,
    "host",
    excluded,
    random,
  );
  const guestFragment = chooseFragment(
    openings,
    "guest",
    excluded,
    random,
  );
  const available = shuffled(
    allPositions().filter(
      (position) => !excluded.has(mazePositionKey(position)),
    ),
    random,
  );
  const altarPositions = available.splice(0, 12);
  altarPositions.forEach((position) =>
    excluded.add(mazePositionKey(position)),
  );
  const skillOrder = shuffled(MAZE_SKILL_IDS, random);
  const altars = altarPositions.map((position, index) => ({
    cellId: mazePositionKey(position),
    options: [0, 1, 2].map(
      (offset) =>
        skillOrder[(index * 2 + offset) % skillOrder.length],
    ),
  }));
  const dangerKinds = shuffled(
    MAZE_DANGER_KINDS.filter(
      (kind): kind is Exclude<MazeDangerKind, "bayangan-sepi"> =>
        kind !== "bayangan-sepi",
    ),
    random,
  );
  const dangerPositions = available.splice(0, 6);
  dangerPositions.forEach((position) =>
    excluded.add(mazePositionKey(position)),
  );
  const dangers = dangerPositions.map((position, index) => ({
    cellId: mazePositionKey(position),
    kind: dangerKinds[index % dangerKinds.length],
  }));
  const hunterCandidates = available
    .filter((position) => !excluded.has(mazePositionKey(position)))
    .sort(
      (first, second) =>
        pathDistance(openings, STARTS.host, second) -
        pathDistance(openings, STARTS.host, first),
    );
  const hostHunter = hunterCandidates[0] ?? { x: 6, y: 6 };
  const guestHunter =
    [...hunterCandidates]
      .filter(
        (position) =>
          mazePositionKey(position) !== mazePositionKey(hostHunter),
      )
      .sort(
        (first, second) =>
          pathDistance(openings, STARTS.guest, second) -
          pathDistance(openings, STARTS.guest, first),
      )[0] ?? { x: 0, y: 0 };
  const fragments = {
    host: mazePositionKey(hostFragment),
    guest: mazePositionKey(guestFragment),
  };
  const optimalMoves =
    pathDistance(openings, STARTS.host, hostFragment) +
    pathDistance(openings, hostFragment, MEETING) +
    pathDistance(openings, STARTS.guest, guestFragment) +
    pathDistance(openings, guestFragment, MEETING);

  return {
    size: MAZE_SIZE,
    openings,
    starts: { host: { ...STARTS.host }, guest: { ...STARTS.guest } },
    meeting: { ...MEETING },
    fragments,
    altars,
    dangers,
    hunterSpawns: {
      host: { ...hostHunter },
      guest: { ...guestHunter },
    },
    optimalMoves,
    maxLight: optimalMoves + Math.max(16, Math.ceil(optimalMoves * 0.45)),
  };
}

export function createMazeSeed() {
  const values = new Uint32Array(1);
  crypto.getRandomValues(values);
  return normalizeSeed(values[0]);
}

export function createInitialLongingMazeState(
  seed = createMazeSeed(),
): LongingMazeState {
  const definition = generateMazeDefinition(seed);
  return {
    schemaVersion: MAZE_SCHEMA_VERSION,
    kind: "longing-maze",
    seed: normalizeSeed(seed),
    phase: "exploring",
    turn: "host",
    round: 1,
    positions: {
      host: { ...definition.starts.host },
      guest: { ...definition.starts.guest },
    },
    players: {
      host: { hearts: MAX_MAZE_HEARTS, fragment: false, skills: [] },
      guest: { hearts: MAX_MAZE_HEARTS, fragment: false, skills: [] },
    },
    light: definition.maxLight,
    bond: 2,
    maxBond: MAX_MAZE_BOND,
    reunionRewardClaimed: false,
    movesUsed: 0,
    wallHits: 0,
    routesSent: 0,
    damagePrevented: 0,
    skillsUsed: 0,
    guidance: null,
    explored: {
      host: [mazePositionKey(definition.starts.host)],
      guest: [mazePositionKey(definition.starts.guest)],
    },
    collectedFragments: [],
    claimedAltars: [],
    resolvedDangers: [],
    pendingDanger: null,
    pendingSkillChoice: null,
    hunters: [
      {
        id: "shadow-host",
        target: "host",
        position: { ...definition.hunterSpawns.host },
      },
      {
        id: "shadow-guest",
        target: "guest",
        position: { ...definition.hunterSpawns.guest },
      },
    ],
    foresightUntil: { host: 0, guest: 0 },
    selfSightUntil: { host: 0, guest: 0 },
    lastSkillRound: { host: -1, guest: -1 },
    bossRound: 0,
    bossChoices: {},
    history: [
      {
        kind: "start",
        actor: null,
        message:
          "Kalian memasuki labirin. Bahaya dirimu hanya terlihat oleh pasanganmu.",
      },
    ],
  };
}

function otherRole(role: PlayerRole): PlayerRole {
  return role === "host" ? "guest" : "host";
}

function playerLabel(role: PlayerRole) {
  return role === "host" ? "Host" : "Pasangan";
}

function prependHistory(
  state: LongingMazeState,
  item: MazeHistoryItem,
) {
  return [item, ...state.history].slice(0, 14);
}

function nextWalker(
  definition: MazeDefinition,
  state: LongingMazeState,
  actor: PlayerRole,
) {
  const other = otherRole(actor);

  const otherIsReadyAtMeeting =
    sameMazePosition(
      state.positions[other],
      definition.meeting,
    ) && state.players[other].fragment;

  if (!otherIsReadyAtMeeting) {
    return other;
  }

  return actor;
}

function removeOneSkill(
  skills: readonly MazeSkillId[],
  skillId: MazeSkillId,
) {
  const index = skills.indexOf(skillId);

  if (index < 0) {
    throw new Error("Skill itu belum kamu miliki.");
  }

  return skills.filter(
    (_, skillIndex) => skillIndex !== index,
  );
}

function resumeAfterTurn(
  state: LongingMazeState,
  actor: PlayerRole,
  definition: MazeDefinition,
) {
  return {
    turn: nextWalker(definition, state, actor),
    round: state.round + 1,
  };
}

function startBoss(state: LongingMazeState): LongingMazeState {
  return {
    ...state,
    phase: "boss",
    bossRound: 1,
    bossChoices: {},
    guidance: null,
    bond: Math.min(state.maxBond, state.bond + 1),
    history: prependHistory(state, {
      kind: "boss",
      actor: null,
      message:
        "Dua Fragmen Hati bersatu. Badai Pemisah bangkit untuk menguji kalian.",
    }),
  };
}

function makeDanger(
  state: LongingMazeState,
  danger: Omit<PendingMazeDanger, "resumeTurn" | "resumeRound">,
  actor: PlayerRole,
  definition: MazeDefinition,
) {
  const resume = resumeAfterTurn(state, actor, definition);
  return {
    ...state,
    phase: "danger" as const,
    guidance: null,
    pendingDanger: {
      ...danger,
      resumeTurn: resume.turn,
      resumeRound: resume.round,
    },
  };
}

function advanceHunter(
  state: LongingMazeState,
  actor: PlayerRole,
  definition: MazeDefinition,
): LongingMazeState {
  if (sameMazePosition(state.positions[actor], definition.meeting)) {
    return state;
  }
  const hunterIndex = state.hunters.findIndex(
    (hunter) => hunter.target === actor,
  );
  const hunter = state.hunters[hunterIndex];
  if (!hunter) return state;
  const path = shortestPath(
    definition.openings,
    hunter.position,
    state.positions[actor],
  );
  const nextPosition = path[1] ?? hunter.position;
  const hunters = state.hunters.map((entry, index) =>
    index === hunterIndex
      ? { ...entry, position: { ...nextPosition } }
      : entry,
  );
  const movedState = { ...state, hunters };
  if (!sameMazePosition(nextPosition, state.positions[actor])) {
    return movedState;
  }
  return {
    ...movedState,
    phase: "danger",
    pendingDanger: {
      kind: "bayangan-sepi",
      target: actor,
      source: "hunter",
      cellId: hunter.id,
      fallbackPosition: { ...state.positions[actor] },
      resumeTurn: state.turn,
      resumeRound: state.round,
    },
    history: prependHistory(movedState, {
      kind: "hunter",
      actor,
      message: `Bayangan Sepi berhasil menyusul ${playerLabel(actor)}.`,
    }),
  };
}

function finishNormalTurn(
  state: LongingMazeState,
  actor: PlayerRole,
  definition: MazeDefinition,
) {
  const resume = resumeAfterTurn(state, actor, definition);
  return advanceHunter(
    {
      ...state,
      phase: "exploring",
      turn: resume.turn,
      round: resume.round,
      guidance: null,
    },
    actor,
    definition,
  );
}

export function planMazeRoute(
  state: LongingMazeState,
  actor: PlayerRole,
  directions: readonly MazeDirection[],
): LongingMazeState {
  if (state.phase !== "exploring") {
    throw new Error("Rute belum dapat dikirim sekarang.");
  }
  if (actor === state.turn) {
    throw new Error("Sekarang kamu berjalan. Tunggu rute dari pasanganmu.");
  }
  if (state.guidance) {
    throw new Error("Rute sudah dikirim. Tunggu pasanganmu berjalan.");
  }
  if (directions.length < 1 || directions.length > 3) {
    throw new Error("Rute harus berisi satu sampai tiga langkah.");
  }
  if (!directions.every((direction) => MAZE_DIRECTIONS.includes(direction))) {
    throw new Error("Rute berisi arah yang tidak valid.");
  }
  return {
    ...state,
    guidance: {
      from: actor,
      to: state.turn,
      directions: [...directions],
      round: state.round,
    },
    routesSent: state.routesSent + 1,
    history: prependHistory(state, {
      kind: "route",
      actor,
      message: `${playerLabel(actor)} mengirim rute ${directions.length} langkah.`,
    }),
  };
}

function applyFirstReunionReward(
  state: LongingMazeState,
): LongingMazeState {
  if (
    state.reunionRewardClaimed ||
    !sameMazePosition(
      state.positions.host,
      state.positions.guest,
    )
  ) {
    return state;
  }

  return {
    ...state,
    reunionRewardClaimed: true,
    bond: state.maxBond,
    players: {
      host: {
        ...state.players.host,
        hearts: Math.min(
          MAX_MAZE_HEARTS,
          state.players.host.hearts + 1,
        ),
      },
      guest: {
        ...state.players.guest,
        hearts: Math.min(
          MAX_MAZE_HEARTS,
          state.players.guest.hearts + 1,
        ),
      },
    },
    history: prependHistory(state, {
      kind: "reunion",
      actor: null,
      message:
        "Kalian akhirnya bertemu. Hati dipulihkan dan Energi Ikatan terisi penuh.",
    }),
  };
}

export function walkMazeRoute(
  state: LongingMazeState,
  actor: PlayerRole,
  trustSteps: number,
): LongingMazeState {
  if (state.phase !== "exploring") {
    throw new Error("Kamu belum dapat berjalan sekarang.");
  }

  if (state.turn !== actor) {
    throw new Error("Sekarang giliranmu menjaga pasangan.");
  }

  if (!state.guidance || state.guidance.to !== actor) {
    throw new Error(
      "Tunggu pasanganmu mengirim rute terlebih dahulu.",
    );
  }

  if (
    !Number.isInteger(trustSteps) ||
    trustSteps < 1 ||
    trustSteps > state.guidance.directions.length
  ) {
    throw new Error(
      "Jumlah langkah kepercayaan tidak valid.",
    );
  }

  const definition = generateMazeDefinition(state.seed);

  let nextState: LongingMazeState = {
    ...state,
    guidance: null,
  };

  let position = {
    ...state.positions[actor],
  };

  let successfulSteps = 0;
  let fallbackPosition = {
    ...position,
  };

  for (
    const direction of state.guidance.directions.slice(
      0,
      trustSteps,
    )
  ) {
    const directionDefinition =
      DIRECTION_BY_NAME.get(direction);

    if (!directionDefinition) {
      continue;
    }

    nextState = {
      ...nextState,
      light: nextState.light - 1,
      movesUsed: nextState.movesUsed + 1,
    };

    const openings =
      definition.openings[indexFor(position)] ?? 0;

    if (
      (openings & directionDefinition.bit) === 0
    ) {
      nextState = {
        ...nextState,
        wallHits: nextState.wallHits + 1,
        history: prependHistory(nextState, {
          kind: "wall",
          actor,
          message:
            `${playerLabel(actor)} menabrak dinding. ` +
            "Rangkaian langkah terhenti.",
        }),
      };

      break;
    }

    const candidate = {
      x: position.x + directionDefinition.dx,
      y: position.y + directionDefinition.dy,
    };

    fallbackPosition = {
      ...position,
    };

    position = candidate;
    successfulSteps += 1;

    const cellId = mazePositionKey(position);

    nextState = {
      ...nextState,
      positions: {
        ...nextState.positions,
        [actor]: {
          ...position,
        },
      },
      explored: {
        ...nextState.explored,
        [actor]: Array.from(
          new Set([
            ...nextState.explored[actor],
            cellId,
          ]),
        ),
      },
    };

    nextState = applyFirstReunionReward(nextState);
    
    const isAvailableFragment =
      Object.values(
        definition.fragments,
      ).includes(cellId) &&
      !nextState.collectedFragments.includes(cellId);

    if (
      isAvailableFragment &&
      !nextState.players[actor].fragment
    ) {
      nextState = {
        ...nextState,
        collectedFragments: [
          ...nextState.collectedFragments,
          cellId,
        ],
        players: {
          ...nextState.players,
          [actor]: {
            ...nextState.players[actor],
            fragment: true,
          },
        },
        bond: Math.min(nextState.maxBond, nextState.bond + 1,
        ),
        history: prependHistory(nextState, {
          kind: "fragment",
          actor,
          message:
            `${playerLabel(actor)} menemukan ` +
            "Fragmen Hati.",
        }),
      };
    } else if (
      isAvailableFragment &&
      nextState.players[actor].fragment
    ) {
      nextState = {
        ...nextState,
        history: prependHistory(nextState, {
          kind: "fragment",
          actor,
          message:
            `${playerLabel(actor)} sudah membawa ` +
            "satu Fragmen Hati. Sisakan fragmen " +
            "ini untuk pasangan.",
        }),
      };
    }

    const danger = definition.dangers.find(
      (entry) =>
        entry.cellId === cellId &&
        !nextState.resolvedDangers.includes(
          entry.cellId,
        ),
    );

    if (danger) {
      nextState = makeDanger(
        nextState,
        {
          kind: danger.kind,
          target: actor,
          source: "trap",
          cellId,
          fallbackPosition,
        },
        actor,
        definition,
      );

      break;
    }

    const altar = definition.altars.find(
      (entry) =>
        entry.cellId === cellId &&
        !nextState.claimedAltars.includes(
          entry.cellId,
        ),
    );

    if (altar) {
      const resume = resumeAfterTurn(
        nextState,
        actor,
        definition,
      );

      nextState = {
        ...nextState,
        phase: "skill-choice",
        pendingSkillChoice: {
          role: actor,
          cellId,
          options: [...altar.options],
          resumeTurn: resume.turn,
          resumeRound: resume.round,
        },
        history: prependHistory(nextState, {
          kind: "skill",
          actor,
          message:
            `${playerLabel(actor)} menemukan ` +
            "Altar Ikatan.",
        }),
      };

      break;
    }

    if (nextState.light <= 0) {
      break;
    }
  }

  nextState = {
    ...nextState,
    bond: Math.min(nextState.maxBond, nextState.bond +
        Math.max(0, successfulSteps - 1),
    ),
  };

  if (nextState.light <= 0) {
    return {
      ...nextState,
      phase: "lost",
      pendingDanger: null,
      pendingSkillChoice: null,
      history: prependHistory(nextState, {
        kind: "lost",
        actor: null,
        message:
          "Cahaya terakhir padam di dalam labirin.",
      }),
    };
  }

  const bothAtMeeting =
    sameMazePosition(
      nextState.positions.host,
      definition.meeting,
    ) &&
    sameMazePosition(
      nextState.positions.guest,
      definition.meeting,
    );

  const bothHaveFragments =
    nextState.players.host.fragment &&
    nextState.players.guest.fragment;

  if (bothAtMeeting && bothHaveFragments) {
    return startBoss(nextState);
  }

  if (
    nextState.phase === "danger" ||
    nextState.phase === "skill-choice"
  ) {
    return nextState;
  }

  return finishNormalTurn(
    {
      ...nextState,
      history: prependHistory(nextState, {
        kind: "move",
        actor,
        message:
          `${playerLabel(actor)} menyelesaikan ` +
          `${successfulSteps} langkah.`,
      }),
    },
    actor,
    definition,
  );
}

export function chooseMazeSkill(
  state: LongingMazeState,
  actor: PlayerRole,
  skillId: MazeSkillId,
): LongingMazeState {
  const choice = state.pendingSkillChoice;
  if (state.phase !== "skill-choice" || !choice) {
    throw new Error("Tidak ada Altar Ikatan yang sedang terbuka.");
  }
  if (choice.role !== actor) {
    throw new Error("Pasanganmu sedang memilih skill.");
  }
  if (!choice.options.includes(skillId)) {
    throw new Error("Skill itu tidak tersedia di altar ini.");
  }
  const currentSkills = state.players[actor].skills;
  const nextSkills = [
    ...(currentSkills.length >= MAX_MAZE_SKILLS
      ? currentSkills.slice(1)
      : currentSkills),
    skillId,
  ];
  const skill = getMazeSkill(skillId);
  return {
    ...state,
    phase: "exploring",
    turn: choice.resumeTurn,
    round: choice.resumeRound,
    players: {
      ...state.players,
      [actor]: { ...state.players[actor], skills: nextSkills },
    },
    claimedAltars: [...state.claimedAltars, choice.cellId],
    pendingSkillChoice: null,
    history: prependHistory(state, {
      kind: "skill",
      actor,
      message: `${playerLabel(actor)} memperoleh ${skill.name} untuk menjaga pasangannya.`,
    }),
  };
}

export function useGuideSkill(
  state: LongingMazeState,
  actor: PlayerRole,
  skillId: MazeSkillId,
): LongingMazeState {
  if (state.phase !== "exploring" || actor === state.turn) {
    throw new Error("Skill ini hanya dapat digunakan saat kamu menjadi penjaga.");
  }
  if (state.lastSkillRound[actor] === state.round) {
    throw new Error("Kamu sudah menggunakan satu skill pada giliran ini.");
  }
  const skill = getMazeSkill(skillId);
  if (skill.timing !== "guide" && skill.timing !== "any") {
    throw new Error("Skill ini hanya dapat digunakan ketika bahaya menyerang.");
  }
  if (!state.players[actor].skills.includes(skillId)) {
    throw new Error("Skill itu belum kamu miliki.");
  }

  if (
    skillId === "pegangan-erat" &&
    state.maxBond >= MAX_MAZE_BOND_CAPACITY
  ) {
    throw new Error("Kapasitas Energi Ikatan sudah maksimum.");
  }
  if (state.bond < skill.cost) throw new Error("Energi Ikatan belum cukup.");

  if (
    skillId === "sentuhan-hangat" &&
    state.players[state.turn].hearts >= MAX_MAZE_HEARTS
  ) {
    throw new Error("Hati pasanganmu sudah penuh.");
  }
  
  const target = state.turn;
  let nextState: LongingMazeState = {
    ...state,
    bond: state.bond - skill.cost,
    skillsUsed: state.skillsUsed + 1,
    players: {
      ...state.players,
      [actor]: {
        ...state.players[actor],
        skills: removeOneSkill(state.players[actor].skills, skillId),
      },
    },
    lastSkillRound: {
      ...state.lastSkillRound,
      [actor]: state.round,
    },
  };
  if (skillId === "pegangan-erat") {
    const maxBond = Math.min(
      MAX_MAZE_BOND_CAPACITY,
      nextState.maxBond + 2,
    );
    nextState = {
      ...nextState,
      maxBond,
      bond: Math.min(maxBond, nextState.bond + 2),
    };
  } else if (skillId === "mata-hati") {
    nextState = {
      ...nextState,
      foresightUntil: {
        ...nextState.foresightUntil,
        [actor]: state.round + 2,
      },
    };
  } else if (skillId === "cahaya-kenangan") {
    const definition = generateMazeDefinition(state.seed);
    nextState = {
      ...nextState,
      light: Math.min(definition.maxLight, state.light + 4),
    };
  } else if (skillId === "langkah-seirama") {
    nextState = {
      ...nextState,
      selfSightUntil: {
        ...nextState.selfSightUntil,
        [target]: state.round + 1,
      },
    };
  } else if (skillId === "sentuhan-hangat") {
    nextState = {
      ...nextState,
      players: {
        ...nextState.players,
        [target]: {
          ...nextState.players[target],
          hearts: Math.min(
            MAX_MAZE_HEARTS,
            nextState.players[target].hearts + 1,
          ),
        },
      },
    };
  } else {
    throw new Error("Skill ini menunggu datangnya bahaya.");
  }
  return {
    ...nextState,
    history: prependHistory(nextState, {
      kind: "skill",
      actor,
      message: `${playerLabel(actor)} menggunakan ${skill.name} untuk pasangannya.`,
    }),
  };
}

export function resolveMazeDanger(
  state: LongingMazeState,
  actor: PlayerRole,
  skillId?: MazeSkillId,
): LongingMazeState {
  const danger = state.pendingDanger;
  if (state.phase !== "danger" || !danger) {
    throw new Error("Tidak ada bahaya yang perlu dihadapi.");
  }
  if (actor !== otherRole(danger.target)) {
    throw new Error("Hanya pasangan yang dapat menghadapi bahaya ini.");
  }
  let nextState: LongingMazeState = { ...state };
  let prevented = false;
  let usedName = "";
  if (skillId) {
    const skill = getMazeSkill(skillId);
    if (!state.players[actor].skills.includes(skillId)) {
      throw new Error("Skill itu belum kamu miliki.");
    }
    if (!skill.counters.includes(danger.kind)) {
      throw new Error("Skill itu tidak cocok untuk menghadapi bahaya ini.");
    }
    if (state.bond < skill.cost) throw new Error("Energi Ikatan belum cukup.");
    prevented = true;
    usedName = skill.name;
    nextState = {
      ...nextState,
      bond: nextState.bond - skill.cost,
      damagePrevented: nextState.damagePrevented + 1,
      skillsUsed: nextState.skillsUsed + 1,
      players: {
        ...nextState.players,
        [actor]: {
          ...nextState.players[actor],
          hearts:
            skillId === "bagi-beban"
              ? Math.max(0, nextState.players[actor].hearts - 1)
              : nextState.players[actor].hearts,
          skills: removeOneSkill(
            nextState.players[actor].skills,
            skillId,
          ),
        },
      },
    };
  }

  if (!prevented) {
    if (
      danger.kind === "duri-sunyi" ||
      danger.kind === "bayangan-sepi"
    ) {
      nextState = {
        ...nextState,
        players: {
          ...nextState.players,
          [danger.target]: {
            ...nextState.players[danger.target],
            hearts: Math.max(
              0,
              nextState.players[danger.target].hearts - 1,
            ),
          },
        },
      };
    } else if (danger.kind === "kabut-ragu") {
      nextState = {
        ...nextState,
        light: Math.max(0, nextState.light - 3),
      };
    } else if (danger.kind === "arus-jarak") {
      nextState = {
        ...nextState,
        positions: {
          ...nextState.positions,
          [danger.target]: { ...danger.fallbackPosition },
        },
        players: {
          ...nextState.players,
          [danger.target]: {
            ...nextState.players[danger.target],
            hearts: Math.max(
              0,
              nextState.players[danger.target].hearts - 1,
            ),
          },
        },
      };
    } else if (danger.kind === "gema-salah-paham") {
      nextState = { ...nextState, bond: 0 };
    }
  }

  if (danger.source === "trap") {
    nextState = {
      ...nextState,
      resolvedDangers: Array.from(
        new Set([...nextState.resolvedDangers, danger.cellId]),
      ),
    };
  } else {
    const definition = generateMazeDefinition(state.seed);
    nextState = {
      ...nextState,
      hunters: nextState.hunters.map((hunter) =>
        hunter.target === danger.target
          ? {
              ...hunter,
              position: { ...definition.hunterSpawns[hunter.target] },
            }
          : hunter,
      ),
    };
  }
  const lost =
    nextState.light <= 0 ||
    nextState.players.host.hearts <= 0 ||
    nextState.players.guest.hearts <= 0;

  return {
    ...nextState,
    phase: lost ? "lost" : "exploring",
    turn: danger.resumeTurn,
    round: danger.resumeRound,
    pendingDanger: null,
    history: prependHistory(nextState, {
      kind: lost ? "lost" : "danger",
      actor,
      dangerResolution: {
        danger: danger.kind,
        target: danger.target,
        protector: actor,
        skillId: skillId ?? null,
        prevented,
      },
      message: lost
        ? "Salah satu hati padam sebelum perjalanan selesai."
        : prevented
          ? `${playerLabel(actor)} melindungi pasangannya dengan ${usedName}.`
          : `${playerLabel(danger.target)} menghadapi bahaya tanpa perlindungan.`,
    }),
  };
}


export function bossAttackFor(
  seed: number,
  round: number,
  target: PlayerRole,
): Exclude<MazeDangerKind, "bayangan-sepi"> {
  const attacks = [
    "duri-sunyi",
    "kabut-ragu",
    "arus-jarak",
    "gema-salah-paham",
  ] as const;
  const offset = target === "host" ? 0 : 2;
  return attacks[(normalizeSeed(seed) + round + offset) % attacks.length];
}

export function protectInBoss(
  state: LongingMazeState,
  actor: PlayerRole,
  protection: MazeBossProtection,
): LongingMazeState {
  if (state.phase !== "boss" || state.bossRound < 1) {
    throw new Error("Badai Pemisah belum dimulai.");
  }
  if (state.bossChoices[actor]) {
    throw new Error("Kamu sudah memilih perlindungan untuk ronde ini.");
  }
  let nextState: LongingMazeState = { ...state };
  if (protection === "bond") {
    if (state.bond < 2) throw new Error("Dibutuhkan dua energi Ikatan.");
    nextState = { ...nextState, bond: nextState.bond - 2 };
  } else if (protection !== "endure") {
    const skill = getMazeSkill(protection);
    if (!state.players[actor].skills.includes(protection)) {
      throw new Error("Skill itu belum kamu miliki.");
    }
    if (state.bond < skill.cost) throw new Error("Energi Ikatan belum cukup.");
    nextState = {
      ...nextState,
      bond: nextState.bond - skill.cost,
      skillsUsed: nextState.skillsUsed + 1,
      players: {
        ...nextState.players,
        [actor]: {
          ...nextState.players[actor],
          skills: removeOneSkill(
            nextState.players[actor].skills,
            protection,
          ),
        },
      },
    };
  }

  const choices = { ...nextState.bossChoices, [actor]: protection };
  nextState = { ...nextState, bossChoices: choices };
  if (!choices.host || !choices.guest) return nextState;

  let players = { ...nextState.players };
  let preventedCount = 0;
  for (const guardian of ["host", "guest"] as const) {
    const target = otherRole(guardian);
    const attack = bossAttackFor(state.seed, state.bossRound, target);
    const choice = choices[guardian];
    const blocked =
      choice === "bond" ||
      (choice !== "endure" &&
        choice !== undefined &&
        getMazeSkill(choice).counters.includes(attack));
    if (blocked) {
      preventedCount += 1;
    } else {
      players = {
        ...players,
        [target]: {
          ...players[target],
          hearts: Math.max(0, players[target].hearts - 1),
        },
      };
    }
    if (choice === "bagi-beban") {
      players = {
        ...players,
        [guardian]: {
          ...players[guardian],
          hearts: Math.max(0, players[guardian].hearts - 1),
        },
      };
    }
  }

  const lost = players.host.hearts <= 0 || players.guest.hearts <= 0;
  const won = !lost && state.bossRound >= 3;
  return {
    ...nextState,
    players,
    phase: lost ? "lost" : won ? "won" : "boss",
    bossRound: lost || won ? state.bossRound : state.bossRound + 1,
    bossChoices: {},
    damagePrevented: nextState.damagePrevented + preventedCount,
    bond:
      lost || won
        ? nextState.bond
        : Math.min(nextState.maxBond, nextState.bond + 1),
    history: prependHistory(nextState, {
      kind: lost ? "lost" : won ? "won" : "boss",
      actor: null,
      message: lost
        ? "Badai memisahkan kalian sebelum perlindungan sempat terbentuk."
        : won
          ? "Kalian saling melindungi sampai Badai Pemisah akhirnya reda."
          : `Gelombang ${state.bossRound} terlewati. Badai kembali menguat.`,
    }),
  };
}

export function restartLongingMaze(seed = createMazeSeed()) {
  return createInitialLongingMazeState(seed);
}

export function mazeResult(
  state: LongingMazeState,
  definition = generateMazeDefinition(state.seed),
) {
  const hearts = Math.min(
    state.players.host.hearts,
    state.players.guest.hearts,
  );

  const efficiency = Math.min(
    100,
    Math.round(
      (definition.optimalMoves /
        Math.max(
          state.movesUsed,
          definition.optimalMoves,
        )) *
        100,
    ),
  );

  return {
    efficiency,
    hearts,
    protected: state.damagePrevented,
    skillsUsed: state.skillsUsed,
  };
}
