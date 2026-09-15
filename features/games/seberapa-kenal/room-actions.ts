import { and, eq, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import {
  continueQuiz,
  submitGuess,
  submitSubjectAnswer,
  type QuizState,
} from "@/features/games/seberapa-kenal/engine";
import { parseQuizState } from "@/features/games/seberapa-kenal/room-view";
import { COUPLE_QUIZ_SLUG } from "@/features/platform/game-registry";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

export type QuizRoomAction =
  | "quiz-submit-subject"
  | "quiz-submit-guess"
  | "quiz-continue";

function requireAnswerIndex(value: unknown) {
  if (typeof value !== "number") {
    throw new Error("Pilihan jawaban tidak valid.");
  }

  return value;
}

export async function applyQuizRoomAction(
  row: RoomRow,
  token: string,
  action: QuizRoomAction,
  answerIndex?: unknown,
) {
  if (row.gameSlug !== COUPLE_QUIZ_SLUG) {
    throw new Error("Room ini bukan room quiz.");
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

  if (row.status === "finished") {
    throw new Error("Permainan sudah selesai.");
  }

  const state = parseQuizState(row.gameState);

  let nextState: QuizState;

  if (action === "quiz-submit-subject") {
    nextState = submitSubjectAnswer(
      state,
      role,
      requireAnswerIndex(answerIndex),
    );
  } else if (action === "quiz-submit-guess") {
    nextState = submitGuess(
      state,
      role,
      requireAnswerIndex(answerIndex),
    );
  } else {
  if (role !== "host") {
    throw new Error(
      "Hanya pembuat room yang bisa melanjutkan ronde.",
    );
  }

  nextState = continueQuiz(state);
}

  const now = new Date().toISOString();
  const db = getDb();

  const [updated] = await db
    .update(gameRooms)
    .set({
      gameState: nextState,
      status:
        nextState.phase === "finished"
          ? "finished"
          : "active",
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
      "Room baru saja diperbarui. Silakan coba lagi.",
    );
  }

  return updated;
}