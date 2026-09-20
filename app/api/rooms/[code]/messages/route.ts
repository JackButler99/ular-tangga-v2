import {
  cleanChatMessage,
  MAX_CHAT_MESSAGE_LENGTH,
} from "@/features/platform/chat/message";
import {
  createRoomMessage,
  listRoomMessages,
} from "@/lib/room-messages";
import { getRoom } from "@/lib/rooms";

type RouteContext = {
  params: Promise<{
    code: string;
  }>;
};

function tokenFrom(request: Request) {
  return request.headers.get("x-player-token") ?? "";
}

function errorResponse(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : "Chat belum dapat dibuka.";

  const status = message.includes("Token pemain")
    ? 403
    : 500;

  return Response.json(
    {
      error: message,
    },
    {
      status,
    },
  );
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

    const result = await listRoomMessages(
      room,
      tokenFrom(request),
    );

    return Response.json(result, {
      headers: {
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    return errorResponse(error);
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
      body?: unknown;
    };

    const body = cleanChatMessage(payload.body);

    if (!body) {
      return Response.json(
        {
          error: "Pesan tidak boleh kosong.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      typeof payload.body === "string" &&
      payload.body.trim().length >
        MAX_CHAT_MESSAGE_LENGTH
    ) {
      return Response.json(
        {
          error: `Pesan maksimal ${MAX_CHAT_MESSAGE_LENGTH} karakter.`,
        },
        {
          status: 400,
        },
      );
    }

    const result = await createRoomMessage(
      room,
      tokenFrom(request),
      body,
    );

    return Response.json(result, {
      status: 201,
    });
  } catch (error) {
    return errorResponse(error);
  }
}