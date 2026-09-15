import {
  applyQuizRoomAction,
  type QuizRoomAction,
} from "@/features/games/seberapa-kenal/room-actions";
import {
  COUPLE_QUIZ_SLUG,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import { toGameRoomView } from "@/features/platform/room/to-game-room-view";
import {
  cleanName,
  completeChallengeForRoom,
  getRoom,
  joinRoom,
  resetRoom,
  rollForRoom,
} from "@/lib/rooms";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

const QUIZ_ACTIONS: readonly QuizRoomAction[] = [
  "quiz-submit-subject",
  "quiz-submit-guess",
  "quiz-continue",
];

function tokenFrom(request: Request) {
  return request.headers.get("x-player-token") ?? "";
}

function isQuizAction(
  value: unknown,
): value is QuizRoomAction {
  return (
    typeof value === "string" &&
    QUIZ_ACTIONS.includes(value as QuizRoomAction)
  );
}

function responseStatus(message: string) {
  if (message.includes("tidak ditemukan")) {
    return 404;
  }

  if (
    message.includes("Belum giliran") ||
    message.includes("Hanya pembuat") ||
    message.includes("tidak dikenali") ||
    message.includes("giliran pasanganmu")
  ) {
    return 403;
  }

  return 409;
}

export async function GET(
  request: Request,
  context: RouteContext,
) {
  const { code } = await context.params;

  try {
    const room = await getRoom(code);

    if (!room) {
      return Response.json(
        {
          error: "Ruang tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    return Response.json(
      toGameRoomView(room, tokenFrom(request)),
      {
        headers: {
          "cache-control": "no-store",
        },
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ruang belum bisa dibuka.";

    return Response.json(
      {
        error: message,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(
  request: Request,
  context: RouteContext,
) {
  const { code } = await context.params;

  try {
    const room = await getRoom(code);

    if (!room) {
      return Response.json(
        {
          error: "Ruang tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    const payload = (await request.json()) as {
      action?: unknown;
      guestName?: unknown;
      answerIndex?: unknown;
    };

    const token = tokenFrom(request);

    if (payload.action === "join") {
      const guestName = cleanName(payload.guestName);

      if (guestName.length < 2) {
        return Response.json(
          {
            error: "Nama panggilan minimal 2 karakter.",
          },
          {
            status: 400,
          },
        );
      }

      const joined = await joinRoom(room, guestName);

      return Response.json({
        ...toGameRoomView(
          joined.room,
          joined.token,
        ),
        token: joined.token,
      });
    }

    if (
      room.gameSlug === COUPLE_QUIZ_SLUG &&
      isQuizAction(payload.action)
    ) {
      const updated = await applyQuizRoomAction(
        room,
        token,
        payload.action,
        payload.answerIndex,
      );

      return Response.json(
        toGameRoomView(updated, token),
      );
    }

    if (room.gameSlug === SNAKE_LADDER_SLUG) {
      if (payload.action === "roll") {
        const updated = await rollForRoom(room, token);

        return Response.json(
          toGameRoomView(updated, token),
        );
      }

      if (payload.action === "complete-challenge") {
        const updated =
          await completeChallengeForRoom(room, token);

        return Response.json(
          toGameRoomView(updated, token),
        );
      }

      if (payload.action === "reset") {
        const updated = await resetRoom(room, token);

        return Response.json(
          toGameRoomView(updated, token),
        );
      }
    }

    return Response.json(
      {
        error: "Aksi tidak dikenali.",
      },
      {
        status: 400,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Aksi belum berhasil.";

    return Response.json(
      {
        error: message,
      },
      {
        status: responseStatus(message),
      },
    );
  }
}