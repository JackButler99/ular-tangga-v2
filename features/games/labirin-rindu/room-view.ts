import { LONGING_MAZE_SLUG } from "@/features/platform/game-registry";
import type {
  BaseRoomView,
  PlayerRole,
} from "@/features/platform/room/types";
import { roleForToken, type RoomRow } from "@/lib/rooms";

import {
  MAZE_DIRECTIONS,
  MAZE_SCHEMA_VERSION,
  MAX_MAZE_BOND,
  MAX_MAZE_BOND_CAPACITY,
  bossAttackFor,
  generateMazeDefinition,
  getOpenDirections,
  mazePositionKey,
  mazeResult,
  sameMazePosition,
  MAX_MAZE_HEARTS,
  type LongingMazeState,
  type MazeBossProtection,
  type MazeDirection,
  type MazeHistoryItem,
  type MazePhase,
  type MazePosition,
} from "./engine";
import {
  getMazeDanger,
  getMazeSkill,
  isMazeDangerKind,
  isMazeSkillId,
  type MazeDangerDefinition,
  type MazeDangerKind,
  type MazeSkillDefinition,
  type MazeSkillId,
} from "./rpg-content";

export type MazeCellView = {
  x: number;
  y: number;
  visible: boolean;
  explored: boolean;
  openings: MazeDirection[] | null;
  special: "meeting" | "altar" | "fragment" | "danger" | null;
  completed: boolean;
  fragmentFor: PlayerRole | null;
  danger: MazeDangerDefinition | null;
  players: PlayerRole[];
  hunters: PlayerRole[];
};

export type LongingMazeRoomView = BaseRoomView & {
  players: {
    host: string;
    guest: string | null;
  };
  game: {
    kind: "longing-maze";
    phase: MazePhase;
    turn: PlayerRole;
    round: number;
    size: number;
    cells: MazeCellView[];
    positions: Record<PlayerRole, MazePosition>;
    meeting: MazePosition;
    arrived: Record<PlayerRole, boolean>;
    playerState: Record<
      PlayerRole,
      {
        hearts: number;
        fragment: boolean;
        skillCount: number;
        skills: MazeSkillDefinition[];
      }
    >;
    light: number;
    maxLight: number;
    bond: number;
    maxBond: number;
    canPlanRoute: boolean;
    canWalkRoute: boolean;
    route: LongingMazeState["guidance"];
    directions: readonly MazeDirection[];
    inventory: MazeSkillDefinition[];
    usableGuideSkillIds: MazeSkillId[];
    pendingSkill: {
      forRole: PlayerRole;
      options: MazeSkillDefinition[] | null;
    } | null;
    pendingDanger: {
      target: PlayerRole;
      canProtect: boolean;
      danger: MazeDangerDefinition | null;
      usableSkillIds: MazeSkillId[];
    } | null;
    boss: {
      round: number;
      totalRounds: number;
      attackOnPartner: MazeDangerDefinition | null;
      submittedYou: boolean;
      submittedPartner: boolean;
      usableSkillIds: MazeSkillId[];
      canUseBond: boolean;
    } | null;
    movesUsed: number;
    wallHits: number;
    routesSent: number;
    damagePrevented: number;
    claimedAltars: number;
    totalAltars: number;
    history: MazeHistoryItem[];
    result: ReturnType<typeof mazeResult> | null;
  };
};

function isPlayerRole(value: unknown): value is PlayerRole {
  return value === "host" || value === "guest";
}

function isPhase(value: unknown): value is MazePhase {
  return (
    value === "exploring" ||
    value === "skill-choice" ||
    value === "danger" ||
    value === "boss" ||
    value === "won" ||
    value === "lost"
  );
}

function isDirection(value: unknown): value is MazeDirection {
  return (
    typeof value === "string" &&
    MAZE_DIRECTIONS.some((direction) => direction === value)
  );
}

function isIntegerAtLeast(value: unknown, minimum: number) {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= minimum
  );
}

function isPosition(
  value: unknown,
  size: number,
): value is MazePosition {
  if (!value || typeof value !== "object") return false;
  const position = value as Record<string, unknown>;
  return (
    isIntegerAtLeast(position.x, 0) &&
    isIntegerAtLeast(position.y, 0) &&
    (position.x as number) < size &&
    (position.y as number) < size
  );
}

function isStringArray(value: unknown) {
  return (
    Array.isArray(value) &&
    value.every((entry) => typeof entry === "string")
  );
}

function isSkillArray(value: unknown): value is MazeSkillId[] {
  return Array.isArray(value) && value.every(isMazeSkillId);
}

function isHistoryItem(value: unknown): value is MazeHistoryItem {
  if (!value || typeof value !== "object") return false;
  const item = value as Record<string, unknown>;
  return (
    typeof item.kind === "string" &&
    (item.actor === null || isPlayerRole(item.actor)) &&
    typeof item.message === "string"
  );
}

function isPlayerState(value: unknown) {
  if (!value || typeof value !== "object") return false;
  const player = value as Record<string, unknown>;
  return (
    isIntegerAtLeast(player.hearts, 0) &&
    (player.hearts as number) <= 3 &&
    typeof player.fragment === "boolean" &&
    isSkillArray(player.skills)
  );
}

function isRoleNumbers(value: unknown, minimum = 0) {
  if (!value || typeof value !== "object") return false;
  const roles = value as Record<string, unknown>;
  return (
    isIntegerAtLeast(roles.host, minimum) &&
    isIntegerAtLeast(roles.guest, minimum)
  );
}

function isRoute(value: unknown) {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  const route = value as Record<string, unknown>;
  return (
    isPlayerRole(route.from) &&
    isPlayerRole(route.to) &&
    route.from !== route.to &&
    Array.isArray(route.directions) &&
    route.directions.length >= 1 &&
    route.directions.length <= 3 &&
    route.directions.every(isDirection) &&
    isIntegerAtLeast(route.round, 1)
  );
}

function isPendingDanger(value: unknown, size: number) {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  const danger = value as Record<string, unknown>;
  return (
    isMazeDangerKind(danger.kind) &&
    isPlayerRole(danger.target) &&
    (danger.source === "trap" || danger.source === "hunter") &&
    typeof danger.cellId === "string" &&
    isPosition(danger.fallbackPosition, size) &&
    isPlayerRole(danger.resumeTurn) &&
    isIntegerAtLeast(danger.resumeRound, 1)
  );
}

function isPendingSkill(value: unknown) {
  if (value === null) return true;
  if (!value || typeof value !== "object") return false;
  const choice = value as Record<string, unknown>;
  return (
    isPlayerRole(choice.role) &&
    typeof choice.cellId === "string" &&
    isSkillArray(choice.options) &&
    isPlayerRole(choice.resumeTurn) &&
    isIntegerAtLeast(choice.resumeRound, 1)
  );
}

function isBossChoice(value: unknown): value is MazeBossProtection {
  return value === "bond" || value === "endure" || isMazeSkillId(value);
}

export function parseLongingMazeState(
  value: unknown,
): LongingMazeState {
  if (!value || typeof value !== "object") {
    throw new Error("State Labirin Rindu tidak valid.");
  }
  const rawState = value as Record<string, unknown>;
  const state: Record<string, unknown> = {
    ...rawState,
    maxBond: rawState.maxBond ?? MAX_MAZE_BOND,
    reunionRewardClaimed:
      rawState.reunionRewardClaimed ?? false,
  };
  if (state.schemaVersion !== MAZE_SCHEMA_VERSION) {
    throw new Error(
      "Room ini memakai versi Labirin lama. Buat room baru untuk bermain Penjaga Hati.",
    );
  }
  const definition =
    typeof state.seed === "number" &&
    Number.isInteger(state.seed) &&
    state.seed > 0
      ? generateMazeDefinition(state.seed)
      : null;
  const positions = state.positions as
    | Record<string, unknown>
    | undefined;
  const players = state.players as
    | Record<string, unknown>
    | undefined;
  const explored = state.explored as
    | Record<string, unknown>
    | undefined;
  const hunters = state.hunters as unknown[] | undefined;
  const choices = state.bossChoices as
    | Record<string, unknown>
    | undefined;

  const huntersValid =
    Array.isArray(hunters) &&
    hunters.every((value) => {
      if (!value || typeof value !== "object") return false;
      const hunter = value as Record<string, unknown>;
      return (
        typeof hunter.id === "string" &&
        isPlayerRole(hunter.target) &&
        isPosition(hunter.position, definition?.size ?? 0)
      );
    });
  const choicesValid =
    Boolean(choices) &&
    [choices?.host, choices?.guest].every(
      (choice) => choice === undefined || isBossChoice(choice),
    );

  if (
    !definition ||
    state.kind !== "longing-maze" ||
    !isPhase(state.phase) ||
    !isPlayerRole(state.turn) ||
    !isIntegerAtLeast(state.round, 1) ||
    !positions ||
    !isPosition(positions.host, definition.size) ||
    !isPosition(positions.guest, definition.size) ||
    !players ||
    !isPlayerState(players.host) ||
    !isPlayerState(players.guest) ||
    !isIntegerAtLeast(state.light, 0) ||
    !isIntegerAtLeast(state.bond, 0) ||
    !isIntegerAtLeast(state.maxBond, MAX_MAZE_BOND) ||
    (state.maxBond as number) > MAX_MAZE_BOND_CAPACITY ||
    (state.bond as number) > (state.maxBond as number) ||
    typeof state.reunionRewardClaimed !== "boolean" ||
    !isIntegerAtLeast(state.movesUsed, 0) ||
    !isIntegerAtLeast(state.wallHits, 0) ||
    !isIntegerAtLeast(state.routesSent, 0) ||
    !isIntegerAtLeast(state.damagePrevented, 0) ||
    !isIntegerAtLeast(state.skillsUsed, 0) ||
    !isRoute(state.guidance) ||
    !explored ||
    !isStringArray(explored.host) ||
    !isStringArray(explored.guest) ||
    !isStringArray(state.claimedAltars) ||
    !isStringArray(state.resolvedDangers) ||
    !isStringArray(state.collectedFragments) ||
    !isPendingDanger(state.pendingDanger, definition.size) ||
    !isPendingSkill(state.pendingSkillChoice) ||
    !huntersValid ||
    !isRoleNumbers(state.foresightUntil) ||
    !isRoleNumbers(state.selfSightUntil) ||
    !isRoleNumbers(state.lastSkillRound, -1) ||
    !isIntegerAtLeast(state.bossRound, 0) ||
    !choicesValid ||
    !Array.isArray(state.history) ||
    !state.history.every(isHistoryItem) ||
    (state.phase === "danger") !== Boolean(state.pendingDanger) ||
    (state.phase === "skill-choice") !==
      Boolean(state.pendingSkillChoice)
  ) {
    throw new Error("State Labirin Rindu tidak valid.");
  }
  return state as unknown as LongingMazeState;
}

function otherRole(role: PlayerRole): PlayerRole {
  return role === "host" ? "guest" : "host";
}

function isInsideWindow(
  cell: MazePosition,
  focus: MazePosition,
  radius: number,
) {
  return (
    Math.abs(cell.x - focus.x) <= radius &&
    Math.abs(cell.y - focus.y) <= radius
  );
}

export function toLongingMazeRoomView(
  row: RoomRow,
  token?: string,
): LongingMazeRoomView {
  if (row.gameSlug !== LONGING_MAZE_SLUG) {
    throw new Error("Room bukan milik permainan Labirin Rindu.");
  }

  const state = parseLongingMazeState(row.gameState);
  const definition = generateMazeDefinition(state.seed);
  const viewer = token ? roleForToken(row, token) : null;
  const partner = viewer ? otherRole(viewer) : null;
  const focus = partner ? state.positions[partner] : null;
  const hasForesight = Boolean(
    viewer && state.foresightUntil[viewer] >= state.round,
  );
  const hasSelfSight = Boolean(
    viewer && state.selfSightUntil[viewer] >= state.round,
  );
  const exploredIds = new Set([
    ...state.explored.host,
    ...state.explored.guest,
  ]);
  const altarByCell = new Map(
    definition.altars.map((altar) => [altar.cellId, altar]),
  );
  const dangerByCell = new Map(
    definition.dangers.map((danger) => [danger.cellId, danger]),
  );
  const cells: MazeCellView[] = [];

  for (let y = 0; y < definition.size; y += 1) {
    for (let x = 0; x < definition.size; x += 1) {
      const position = { x, y };
      const cellId = mazePositionKey(position);
      const aroundPartner = Boolean(
        focus && isInsideWindow(position, focus, 2),
      );
      const aroundSelf = Boolean(
        viewer &&
          isInsideWindow(
            position,
            state.positions[viewer],
            hasSelfSight ? 2 : 1,
          ),
      );
      const visible = aroundPartner || aroundSelf;
      const explored = exploredIds.has(cellId);
      const altar = altarByCell.get(cellId);
      const dangerCell = dangerByCell.get(cellId);
      const unresolvedDanger =
        dangerCell && !state.resolvedDangers.includes(cellId)
          ? dangerCell
          : null;
      const insideOwnBlindSpot = Boolean(
        viewer &&
          isInsideWindow(position, state.positions[viewer], 1),
      );
      const dangerVisible = Boolean(
        unresolvedDanger &&
          viewer &&
          !insideOwnBlindSpot &&
          (visible || hasForesight),
      );
      const fragmentFor = (
        ["host", "guest"] as const
      ).find((role) => definition.fragments[role] === cellId) ?? null;
      const fragmentCollected = Boolean(
        fragmentFor &&
          state.collectedFragments.includes(cellId),
        );

    const fragmentVisible = Boolean(
      fragmentFor &&
        !fragmentCollected &&
        (visible || explored),
    );
      const altarVisible = Boolean(
        altar &&
          (visible || explored || state.claimedAltars.includes(cellId)),
      );
      const players = (
        ["host", "guest"] as const
      ).filter((role) =>
        sameMazePosition(position, state.positions[role]),
      );
      const hunters = state.hunters
        .filter(
          (hunter) =>
            viewer === otherRole(hunter.target) &&
            (hasForesight ||
              isInsideWindow(
                hunter.position,
                state.positions[hunter.target],
                2,
              )) &&
            sameMazePosition(position, hunter.position),
        )
        .map((hunter) => hunter.target);
      const meeting = sameMazePosition(position, definition.meeting);

      cells.push({
        x,
        y,
        visible,
        explored,
        openings: visible
          ? getOpenDirections(definition, position)
          : null,
        special: meeting
          ? "meeting"
          : fragmentVisible
            ? "fragment"
            : altarVisible
              ? "altar"
              : dangerVisible
                ? "danger"
                : null,
        completed: Boolean(
          (altar && state.claimedAltars.includes(cellId)) ||
            (dangerCell && state.resolvedDangers.includes(cellId)) ||
            (fragmentFor && fragmentCollected),
        ),
        fragmentFor,
        danger: dangerVisible && unresolvedDanger
          ? getMazeDanger(unresolvedDanger.kind)
          : null,
        players,
        hunters,
      });
    }
  }

  const inventory = viewer
    ? state.players[viewer].skills.map(getMazeSkill)
    : [];
  const usableGuideSkillIds =
    viewer && viewer !== state.turn && state.phase === "exploring"
      ? inventory
          .filter(
            (skill) =>
              (skill.timing === "guide" ||
                skill.timing === "any") &&
              skill.cost <= state.bond &&
              (skill.id !== "pegangan-erat" ||
                state.maxBond < MAX_MAZE_BOND_CAPACITY) &&
              (skill.id !== "sentuhan-hangat" ||
                state.players[state.turn].hearts <
                  MAX_MAZE_HEARTS) &&
              state.lastSkillRound[viewer] !== state.round,
          ).map((skill) => skill.id)
      : [];
  const pendingDanger = state.pendingDanger;
  const canProtect = Boolean(
    viewer &&
      pendingDanger &&
      viewer === otherRole(pendingDanger.target),
  );
  const dangerDefinition =
    pendingDanger && canProtect
      ? getMazeDanger(pendingDanger.kind)
      : null;
  const dangerSkillIds =
    pendingDanger && canProtect
      ? inventory
          .filter(
            (skill) =>
              skill.cost <= state.bond &&
              skill.counters.includes(pendingDanger.kind),
          )
          .map((skill) => skill.id)
      : [];
  const attackOnPartner: MazeDangerKind | null =
    viewer && partner && state.phase === "boss"
      ? bossAttackFor(state.seed, state.bossRound, partner)
      : null;
  const bossSkillIds = attackOnPartner
    ? inventory
        .filter(
          (skill) =>
            skill.cost <= state.bond &&
            skill.counters.includes(attackOnPartner),
        )
        .map((skill) => skill.id)
    : [];
  const finished = state.phase === "won" || state.phase === "lost";

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    you: viewer,
    updatedAt: row.updatedAt,
    players: {
      host: row.hostName,
      guest: row.guestName,
    },
    game: {
      kind: "longing-maze",
      phase: state.phase,
      turn: state.turn,
      round: state.round,
      size: definition.size,
      cells,
      positions: state.positions,
      meeting: definition.meeting,
      arrived: {
        host: sameMazePosition(
          state.positions.host,
          definition.meeting,
        ),
        guest: sameMazePosition(
          state.positions.guest,
          definition.meeting,
        ),
      },
      playerState: {
        host: {
          hearts: state.players.host.hearts,
          fragment: state.players.host.fragment,
          skillCount: state.players.host.skills.length,
          skills: state.players.host.skills.map(getMazeSkill),
        },
        guest: {
          hearts: state.players.guest.hearts,
          fragment: state.players.guest.fragment,
          skillCount: state.players.guest.skills.length,
          skills: state.players.guest.skills.map(getMazeSkill),
        },
      },
      light: state.light,
      maxLight: definition.maxLight,
      bond: state.bond,
      maxBond: state.maxBond,
      canPlanRoute: Boolean(
        viewer && viewer !== state.turn && state.phase === "exploring",
      ),
      canWalkRoute: Boolean(
        viewer &&
          viewer === state.turn &&
          state.phase === "exploring" &&
          state.guidance?.to === viewer,
      ),
      route:
        viewer &&
        state.guidance &&
        (state.guidance.from === viewer || state.guidance.to === viewer)
          ? state.guidance
          : null,
      directions: MAZE_DIRECTIONS,
      inventory,
      usableGuideSkillIds,
      pendingSkill: state.pendingSkillChoice
        ? {
            forRole: state.pendingSkillChoice.role,
            options:
              viewer === state.pendingSkillChoice.role
                ? state.pendingSkillChoice.options.map(getMazeSkill)
                : null,
          }
        : null,
      pendingDanger: pendingDanger
        ? {
            target: pendingDanger.target,
            canProtect,
            danger: dangerDefinition,
            usableSkillIds: dangerSkillIds,
          }
        : null,
      boss:
        state.phase === "boss"
          ? {
              round: state.bossRound,
              totalRounds: 3,
              attackOnPartner: attackOnPartner
                ? getMazeDanger(attackOnPartner)
                : null,
              submittedYou: Boolean(
                viewer && state.bossChoices[viewer],
              ),
              submittedPartner: Boolean(
                partner && state.bossChoices[partner],
              ),
              usableSkillIds: bossSkillIds,
              canUseBond: state.bond >= 2,
            }
          : null,
      movesUsed: state.movesUsed,
      wallHits: state.wallHits,
      routesSent: state.routesSent,
      damagePrevented: state.damagePrevented,
      claimedAltars: state.claimedAltars.length,
      totalAltars: definition.altars.length,
      history: state.history,
      result: finished ? mazeResult(state, definition) : null,
    },
  };
}
