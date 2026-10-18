import {
  CRYPTOGRAM_CINTA_SLUG,
  isPlayableGameSlug,
  SNAKE_LADDER_SLUG,
} from "@/features/platform/game-registry";
import {
  DEFAULT_CRYPTOGRAM_LANGUAGE,
  isCryptogramLanguage,
} from "@/features/games/cryptogram-cinta/content";
import { toGameRoomView } from "@/features/platform/room/to-game-room-view";
import {
  cleanName,
  createRoom,
} from "@/lib/rooms";
import {
  DEFAULT_QUESTION_COUNT,
  isQuestionCount,
} from "@/features/platform/question-count";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      hostName?: unknown;
      gameSlug?: unknown;
      questionCount?: unknown;
      cryptogramLanguage?: unknown;
    };

    const hostName = cleanName(payload.hostName);

    const gameSlug =
      typeof payload.gameSlug === "string"
        ? payload.gameSlug
        : SNAKE_LADDER_SLUG;

    if (hostName.length < 2) {
      return Response.json(
        {
          error: "Nama panggilan minimal 2 karakter.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isPlayableGameSlug(gameSlug)) {
      return Response.json(
        {
          error: "Permainan belum tersedia.",
        },
        {
          status: 400,
        },
      );
    }
    if (
      payload.questionCount !== undefined &&
      !isQuestionCount(payload.questionCount)
    ) {
      return Response.json(
        {
          error:
            "Jumlah pertanyaan harus 5, 10, atau 15.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      gameSlug === CRYPTOGRAM_CINTA_SLUG &&
      payload.cryptogramLanguage !== undefined &&
      !isCryptogramLanguage(payload.cryptogramLanguage)
    ) {
      return Response.json(
        {
          error: "Bahasa kutipan harus Bahasa Indonesia atau Inggris.",
        },
        {
          status: 400,
        },
      );
    }

    const questionCount = isQuestionCount(
      payload.questionCount,
    )
      ? payload.questionCount
      : DEFAULT_QUESTION_COUNT;
    const cryptogramLanguage = isCryptogramLanguage(
      payload.cryptogramLanguage,
    )
      ? payload.cryptogramLanguage
      : DEFAULT_CRYPTOGRAM_LANGUAGE;

    const { room, token } = await createRoom(
      hostName,
      gameSlug,
      questionCount,
      cryptogramLanguage,
    );

    return Response.json(
      {
        ...toGameRoomView(room, token),
        token,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Ruang belum berhasil dibuat.";

    console.error("CREATE_ROOM_ERROR:", error);

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
