import {
  cleanName,
  completeChallengeForRoom,
  getRoom,
  joinRoom,
  resetRoom,
  rollForRoom,
  toRoomView,
} from "@/lib/rooms";

type RouteContext = { params: Promise<{ code: string }> };

function tokenFrom(request: Request) {
  return request.headers.get("x-player-token") ?? "";
}

function responseStatus(message: string) {
  if (message.includes("tidak ditemukan")) return 404;
  if (
    message.includes("Belum giliran") ||
    message.includes("Hanya pembuat") ||
    message.includes("tidak dikenali") ||
    message.includes("giliran pasanganmu")
  ) return 403;
  return 409;
}

export async function GET(request: Request, context: RouteContext) {
  const { code } = await context.params;
  try {
    const room = await getRoom(code);
    if (!room) return Response.json({ error: "Ruang tidak ditemukan." }, { status: 404 });
    return Response.json(toRoomView(room, tokenFrom(request)), {
      headers: { "cache-control": "no-store" },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ruang belum bisa dibuka.";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request, context: RouteContext) {
  const { code } = await context.params;
  try {
    const room = await getRoom(code);
    if (!room) return Response.json({ error: "Ruang tidak ditemukan." }, { status: 404 });
    const payload = (await request.json()) as { action?: string; guestName?: unknown };
    const token = tokenFrom(request);

    if (payload.action === "join") {
      const guestName = cleanName(payload.guestName);
      if (guestName.length < 2) {
        return Response.json({ error: "Nama panggilan minimal 2 karakter." }, { status: 400 });
      }
      const joined = await joinRoom(room, guestName);
      return Response.json({ ...toRoomView(joined.room, joined.token), token: joined.token });
    }

    if (payload.action === "roll") {
      const updated = await rollForRoom(room, token);
      return Response.json(toRoomView(updated, token));
    }

    if (payload.action === "complete-challenge") {
      const updated = await completeChallengeForRoom(room, token);
      return Response.json(toRoomView(updated, token));
    }

    if (payload.action === "reset") {
      const updated = await resetRoom(room, token);
      return Response.json(toRoomView(updated, token));
    }

    return Response.json({ error: "Aksi tidak dikenali." }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Aksi belum berhasil.";
    return Response.json({ error: message }, { status: responseStatus(message) });
  }
}