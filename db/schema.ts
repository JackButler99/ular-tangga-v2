import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const gameRooms = pgTable("game_rooms", {
  code: text("code").primaryKey(),
  gameSlug: text("game_slug")
    .notNull()
    .default("ular-tangga"),
  gameState: jsonb("game_state")
    .$type<unknown>()
    .notNull()
    .default({}),
  hostName: text("host_name").notNull(),
  hostToken: text("host_token").notNull(),

  guestName: text("guest_name"),
  guestToken: text("guest_token"),

  hostPosition: integer("host_position")
    .notNull()
    .default(1),
  guestPosition: integer("guest_position")
    .notNull()
    .default(1),

  turn: text("turn", {
    enum: ["host", "guest"],
  })
    .notNull()
    .default("host"),

  status: text("status", {
    enum: ["waiting", "active", "finished"],
  })
    .notNull()
    .default("waiting"),

  winner: text("winner", {
    enum: ["host", "guest"],
  }),

  lastRoll: integer("last_roll"),
  challenge: text("challenge"),
  history: text("history").notNull().default("[]"),
  version: integer("version").notNull().default(0),

  createdAt: timestamp("created_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),

  updatedAt: timestamp("updated_at", {
    withTimezone: true,
    mode: "string",
  })
    .notNull()
    .defaultNow(),
});

export const roomMessages = pgTable(
  "room_messages",
  {
    id: serial("id").primaryKey(),

    roomCode: text("room_code")
      .notNull()
      .references(() => gameRooms.code, {
        onDelete: "cascade",
      }),

    senderRole: text("sender_role", {
      enum: ["host", "guest"],
    }).notNull(),

    body: text("body").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
      mode: "string",
    })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("room_messages_room_id_idx").on(
      table.roomCode,
      table.id,
    ),
  ],
);