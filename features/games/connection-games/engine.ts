import type { ConnectionGameSlug } from "@/features/platform/game-registry";
import {
  DEFAULT_QUESTION_COUNT,
  type QuestionCount,
} from "@/features/platform/question-count";
import type { PlayerRole } from "@/features/platform/room/types";

import {
  getPickOneRound,
  PICK_ONE_ROUNDS,
  type PickOneAnswer,
  type PickOneChapter,
} from "./content";

export const INITIAL_HEART_BETS = 2;

export type PickOnePhase =
  | "answering"
  | "reveal"
  | "finished";

export type PickOneState = {
  schemaVersion: 2;
  kind: "pick-one";
  roundIds: string[];
  roundIndex: number;
  phase: PickOnePhase;
  answers: Record<PlayerRole, PickOneAnswer | null>;
  roundBets: Record<PlayerRole, boolean>;
  betsRemaining: Record<PlayerRole, number>;
  matchCount: number;
  sparkCount: number;
  currentStreak: number;
  bestStreak: number;
  lastSparkAward: number;
};

function emptyAnswers(): PickOneState["answers"] {
  return {
    host: null,
    guest: null,
  };
}

function emptyRoundBets(): PickOneState["roundBets"] {
  return {
    host: false,
    guest: false,
  };
}

function shuffle<T>(items: readonly T[]) {
  const result = [...items];

  for (
    let index = result.length - 1;
    index > 0;
    index -= 1
  ) {
    const randomIndex = Math.floor(
      Math.random() * (index + 1),
    );

    [result[index], result[randomIndex]] = [
      result[randomIndex],
      result[index],
    ];
  }

  return result;
}

const CHAPTER_ORDER: readonly PickOneChapter[] = [
  "pemanasan",
  "koneksi",
  "lebih-dalam",
];

const CHAPTER_COUNTS: Record<
  QuestionCount,
  readonly [number, number, number]
> = {
  5: [2, 2, 1],
  10: [3, 4, 3],
  15: [4, 6, 5],
};

export function selectPickOneRoundIds(
  questionCount: QuestionCount,
) {
  const counts = CHAPTER_COUNTS[questionCount];

  return CHAPTER_ORDER.flatMap((chapter, index) => {
    const pool = PICK_ONE_ROUNDS.filter(
      (round) => round.chapter === chapter,
    );
    const count = counts[index];

    if (pool.length < count) {
      throw new Error(
        `Babak ${chapter} tidak memiliki cukup pertanyaan.`,
      );
    }

    return shuffle(pool)
      .slice(0, count)
      .map((round) => round.id);
  });
}

export function isPowerRound(roundIndex: number) {
  return (roundIndex + 1) % 4 === 0;
}

export function createInitialPickOneState(
  questionCount: QuestionCount = DEFAULT_QUESTION_COUNT,
): PickOneState {
  return {
    schemaVersion: 2,
    kind: "pick-one",
    roundIds: selectPickOneRoundIds(questionCount),
    roundIndex: 0,
    phase: "answering",
    answers: emptyAnswers(),
    roundBets: emptyRoundBets(),
    betsRemaining: {
      host: INITIAL_HEART_BETS,
      guest: INITIAL_HEART_BETS,
    },
    matchCount: 0,
    sparkCount: 0,
    currentStreak: 0,
    bestStreak: 0,
    lastSparkAward: 0,
  };
}

export function createInitialConnectionState(
  _gameSlug: ConnectionGameSlug,
  questionCount: QuestionCount = DEFAULT_QUESTION_COUNT,
): PickOneState {
  return createInitialPickOneState(questionCount);
}

export function getCurrentPickOneRound(
  state: PickOneState,
) {
  const roundId = state.roundIds[state.roundIndex];

  if (!roundId) {
    throw new Error("Ronde Pilih Mana tidak valid.");
  }

  return getPickOneRound(roundId);
}

export function submitPickOneAnswer(
  state: PickOneState,
  actor: PlayerRole,
  answer: PickOneAnswer,
  useBet = false,
): PickOneState {
  if (state.phase !== "answering") {
    throw new Error("Ronde ini tidak sedang menerima jawaban.");
  }

  if (state.answers[actor] !== null) {
    throw new Error("Kamu sudah menjawab ronde ini.");
  }

  if (answer !== "a" && answer !== "b") {
    throw new Error("Pilihan tidak valid.");
  }

  if (useBet && state.betsRemaining[actor] <= 0) {
    throw new Error("Heart Bet milikmu sudah habis.");
  }

  const answers = {
    ...state.answers,
    [actor]: answer,
  };
  const roundBets = {
    ...state.roundBets,
    [actor]: useBet,
  };
  const betsRemaining = {
    ...state.betsRemaining,
    [actor]:
      state.betsRemaining[actor] - (useBet ? 1 : 0),
  };

  const bothAnswered =
    answers.host !== null && answers.guest !== null;

  if (!bothAnswered) {
    return {
      ...state,
      answers,
      roundBets,
      betsRemaining,
    };
  }

  const matched = answers.host === answers.guest;
  const betBonus =
    Number(roundBets.host) + Number(roundBets.guest);
  const baseSpark = isPowerRound(state.roundIndex) ? 2 : 1;
  const sparkAward = matched ? baseSpark + betBonus : 0;
  const currentStreak = matched
    ? state.currentStreak + 1
    : 0;

  return {
    ...state,
    answers,
    roundBets,
    betsRemaining,
    phase: "reveal",
    matchCount: state.matchCount + (matched ? 1 : 0),
    sparkCount: state.sparkCount + sparkAward,
    currentStreak,
    bestStreak: Math.max(state.bestStreak, currentStreak),
    lastSparkAward: sparkAward,
  };
}

export function continuePickOne(
  state: PickOneState,
): PickOneState {
  if (state.phase !== "reveal") {
    throw new Error("Hasil ronde belum dapat dilanjutkan.");
  }

  const nextRoundIndex = state.roundIndex + 1;

  if (nextRoundIndex >= state.roundIds.length) {
    return {
      ...state,
      phase: "finished",
    };
  }

  return {
    ...state,
    roundIndex: nextRoundIndex,
    phase: "answering",
    answers: emptyAnswers(),
    roundBets: emptyRoundBets(),
    lastSparkAward: 0,
  };
}
