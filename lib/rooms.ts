import { and, eq, isNull, sql } from "drizzle-orm";
import { getDb } from "@/db";
import { gameRooms } from "@/db/schema";
import {
  CHALLENGES,
  CHALLENGE_POSITIONS,
  resolveMove,
  type GameHistoryItem,
  type PlayerRole,
  type RoomView,
} from "@/lib/game";

type RoomRow = typeof gameRooms.$inferSelect;

const ROOM_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export function cleanName(value: unknown) {
  if (typeof value !== "string") return "";
  return value.trim().replace(/\s+/g, " ").slice(0, 20);
}

export function cleanCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 8);
}

export function createRoomCode() {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => ROOM_ALPHABET[byte % ROOM_ALPHABET.length]).join("");
}

export function createPlayerToken() {
  return `${crypto.randomUUID()}-${crypto.randomUUID()}`;
}

function parseHistory(value: string): GameHistoryItem[] {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function roleForToken(row: RoomRow, token: string): PlayerRole | null {
  if (token && token === row.hostToken) return "host";
  if (token && token === row.guestToken) return "guest";
  return null;
}

export function toRoomView(row: RoomRow, token = ""): RoomView {
  const winnerName = row.winner === "host" ? row.hostName : row.winner === "guest" ? row.guestName : null;
  const history = parseHistory(row.history);
  const challengeFor = row.challenge
    ? (history.find((item) => item.role)?.role ?? row.turn)
    : null;

  return {
    code: row.code,
    gameSlug: row.gameSlug,
    status: row.status,
    turn: row.turn,
    you: roleForToken(row, token),
    players: {
      host: { name: row.hostName, position: row.hostPosition },
      guest: row.guestName ? { name: row.guestName, position: row.guestPosition } : null,
    },
    winner: row.winner && winnerName ? { role: row.winner, name: winnerName } : null,
    lastRoll: row.lastRoll,
    challenge: row.challenge,
    challengeFor,
    history,
    updatedAt: row.updatedAt,
  };
}

export async function getRoom(code: string) {
  const db = getDb();
  const [room] = await db.select().from(gameRooms).where(eq(gameRooms.code, cleanCode(code))).limit(1);
  return room ?? null;
}

export async function createRoom(
  hostName: string,
  gameSlug: string,
) {
  const db = getDb();
  const token = createPlayerToken();
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = createRoomCode();
    const now = new Date().toISOString();
    const history: GameHistoryItem[] = [
      { at: now, role: "host", title: `${hostName} membuat ruang`, detail: "Menunggu pasangan bergabung." },
    ];
    try {
      const [room] = await db
        .insert(gameRooms)
        .values({ code, gameSlug, hostName, hostToken: token, history: JSON.stringify(history), updatedAt: now })
        .returning();
      return { room, token };
    } catch (error) {
      if (attempt === 4) throw error;
    }
  }
  throw new Error("Tidak dapat membuat kode ruang.");
}

export async function joinRoom(row: RoomRow, guestName: string) {
  if (row.guestToken || row.status !== "waiting") throw new Error("Ruang ini sudah lengkap.");
  const token = createPlayerToken();
  const now = new Date().toISOString();
  const history: GameHistoryItem[] = [
    { at: now, role: "guest" as const, title: `${guestName} sudah bergabung`, detail: "Permainan dimulai. Giliran host lebih dulu." },
    ...parseHistory(row.history),
  ].slice(0, 12);
  const db = getDb();
  const [updated] = await db
    .update(gameRooms)
    .set({
      guestName,
      guestToken: token,
      status: "active",
      history: JSON.stringify(history),
      updatedAt: now,
      version: sql`${gameRooms.version} + 1`,
    })
    .where(and(eq(gameRooms.code, row.code), eq(gameRooms.version, row.version), isNull(gameRooms.guestToken)))
    .returning();
  if (!updated) throw new Error("Pasanganmu baru saja bergabung dari perangkat lain.");
  return { room: updated, token };
}

export async function rollForRoom(row: RoomRow, token: string) {
  const role = roleForToken(row, token);
  if (!role) throw new Error("Sesi pemain tidak dikenali. Buka kembali tautan undanganmu.");
  if (row.status === "waiting") throw new Error("Tunggu pasanganmu bergabung dulu.");
  if (row.status === "finished") throw new Error("Permainan sudah selesai.");
  if (row.challenge) throw new Error("Selesaikan Petak Cerita sebelum melempar lagi.");
  if (row.turn !== role) throw new Error("Belum giliranmu melempar dadu.");

  const rollBytes = new Uint8Array(1);
  crypto.getRandomValues(rollBytes);
  const roll = (rollBytes[0] % 6) + 1;
  const previous = role === "host" ? row.hostPosition : row.guestPosition;
  const move = resolveMove(previous, roll);
  const playerName = role === "host" ? row.hostName : row.guestName ?? "Pasangan";
  const won = move.position === 100;
  const nextTurn: PlayerRole = role === "host" ? "guest" : "host";
  const now = new Date().toISOString();
  const challenge = !won && CHALLENGE_POSITIONS.includes(move.position)
    ? CHALLENGES[(move.position + roll + row.version) % CHALLENGES.length]
    : null;

  let detail = `Dari petak ${previous} ke ${move.position}.`;
  if (move.transition === "ladder") detail = `Momen manis! Naik dari ${move.attempted} ke ${move.position}.`;
  if (move.transition === "snake") detail = `Ups, salah paham. Turun dari ${move.attempted} ke ${move.position}.`;
  if (move.exactRequired) detail = `Butuh angka pas untuk mencapai 100. Tetap di petak ${previous}.`;
  if (won) detail = "Sampai di petak 100 dan memenangkan permainan!";

  const history: GameHistoryItem[] = [
    { at: now, role, title: `${playerName} melempar ${roll}`, detail },
    ...parseHistory(row.history),
  ].slice(0, 12);
  const db = getDb();
  const [updated] = await db
    .update(gameRooms)
    .set({
      hostPosition: role === "host" ? move.position : row.hostPosition,
      guestPosition: role === "guest" ? move.position : row.guestPosition,
      turn: won || challenge ? role : nextTurn,
      status: won ? "finished" : "active",
      winner: won ? role : null,
      lastRoll: roll,
      challenge,
      history: JSON.stringify(history),
      updatedAt: now,
      version: sql`${gameRooms.version} + 1`,
    })
    .where(and(eq(gameRooms.code, row.code), eq(gameRooms.version, row.version)))
    .returning();
  if (!updated) throw new Error("Giliran baru saja berubah. Coba lagi.");
  return updated;
}

export async function completeChallengeForRoom(row: RoomRow, token: string) {
  const role = roleForToken(row, token);
  if (!role) throw new Error("Sesi pemain tidak dikenali. Buka kembali tautan undanganmu.");
  if (!row.challenge) throw new Error("Tidak ada Petak Cerita yang perlu diselesaikan.");

  const currentHistory = parseHistory(row.history);
  const challengeFor = currentHistory.find((item) => item.role)?.role ?? row.turn;
  if (role !== challengeFor) {
    throw new Error("Petak Cerita ini sedang menjadi giliran pasanganmu.");
  }

  const playerName = role === "host" ? row.hostName : row.guestName ?? "Pasangan";
  const nextTurn: PlayerRole = role === "host" ? "guest" : "host";
  const nextPlayerName = nextTurn === "host" ? row.hostName : row.guestName ?? "Pasangan";
  const now = new Date().toISOString();
  const history: GameHistoryItem[] = [
    {
      at: now,
      role,
      title: `${playerName} menyelesaikan Petak Cerita`,
      detail: `Giliran berpindah ke ${nextPlayerName}.`,
    },
    ...currentHistory,
  ].slice(0, 12);

  const db = getDb();
  const [updated] = await db
    .update(gameRooms)
    .set({
      turn: nextTurn,
      challenge: null,
      history: JSON.stringify(history),
      updatedAt: now,
      version: sql`${gameRooms.version} + 1`,
    })
    .where(and(eq(gameRooms.code, row.code), eq(gameRooms.version, row.version)))
    .returning();

  if (!updated) throw new Error("Petak Cerita baru saja diperbarui. Coba lagi.");
  return updated;
}

export async function resetRoom(row: RoomRow, token: string) {
  if (token !== row.hostToken) throw new Error("Hanya pembuat ruang yang bisa mengulang permainan.");
  if (!row.guestToken) throw new Error("Pasanganmu belum bergabung.");
  const now = new Date().toISOString();
  const history: GameHistoryItem[] = [
    { at: now, role: "host", title: "Permainan baru dimulai", detail: "Kedua pion kembali ke petak pertama." },
  ];
  const db = getDb();
  const [updated] = await db
    .update(gameRooms)
    .set({
      hostPosition: 1,
      guestPosition: 1,
      turn: "host",
      status: "active",
      winner: null,
      lastRoll: null,
      challenge: null,
      history: JSON.stringify(history),
      updatedAt: now,
      version: sql`${gameRooms.version} + 1`,
    })
    .where(and(eq(gameRooms.code, row.code), eq(gameRooms.version, row.version)))
    .returning();
  if (!updated) throw new Error("Ruang baru saja berubah. Coba lagi.");
  return updated;
}
