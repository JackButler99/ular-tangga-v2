import { desc, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { roomMessages } from "@/db/schema";
import type { PlayerRole } from "@/features/platform/room/types";
import {
  roleForToken,
  type RoomRow,
} from "@/lib/rooms";

const MESSAGE_LIMIT = 60;

export type RoomMessageView = {
  id: number;
  senderRole: PlayerRole;
  senderName: string;
  body: string;
  createdAt: string;
};

function requirePlayerRole(
  room: RoomRow,
  token: string,
) {
  const role = roleForToken(room, token);

  if (!role) {
    throw new Error("Token pemain tidak valid.");
  }

  return role;
}

function senderName(
  room: RoomRow,
  role: PlayerRole,
) {
  return role === "host"
    ? room.hostName
    : room.guestName ?? "Pasangan";
}

function toMessageView(
  room: RoomRow,
  message: typeof roomMessages.$inferSelect,
): RoomMessageView {
  return {
    id: message.id,
    senderRole: message.senderRole,
    senderName: senderName(
      room,
      message.senderRole,
    ),
    body: message.body,
    createdAt: message.createdAt,
  };
}

export async function listRoomMessages(
  room: RoomRow,
  token: string,
) {
  const viewerRole = requirePlayerRole(room, token);
  const db = getDb();

  const rows = await db
    .select()
    .from(roomMessages)
    .where(eq(roomMessages.roomCode, room.code))
    .orderBy(desc(roomMessages.id))
    .limit(MESSAGE_LIMIT);

  return {
    viewerRole,
    messages: rows
      .reverse()
      .map((message) =>
        toMessageView(room, message),
      ),
  };
}

export async function createRoomMessage(
  room: RoomRow,
  token: string,
  body: string,
) {
  const senderRole = requirePlayerRole(room, token);
  const db = getDb();

  const [message] = await db
    .insert(roomMessages)
    .values({
      roomCode: room.code,
      senderRole,
      body,
    })
    .returning();

  return {
    viewerRole: senderRole,
    message: toMessageView(room, message),
  };
}