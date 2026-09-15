export type PlayerRole = "host" | "guest";

export type RoomStatus = "waiting" | "active" | "finished";

export type GameHistoryItem = {
  at: string;
  role: PlayerRole | null;
  title: string;
  detail: string;
};

export type BaseRoomView = {
  code: string;
  gameSlug: string;
  status: RoomStatus;
  you: PlayerRole | null;
  updatedAt: string;
};