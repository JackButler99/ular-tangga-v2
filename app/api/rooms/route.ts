import {
  cleanName,
  createRoom,
  toRoomView,
} from "@/lib/rooms";

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as {
      hostName?: unknown;
    };

    const hostName = cleanName(payload.hostName);

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

    const { room, token } = await createRoom(hostName);

    return Response.json(
      {
        ...toRoomView(room, token),
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