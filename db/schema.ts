import {
  integer,
  pgTable,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

export const gameRooms = pgTable("game_rooms", {
  code: text("code").primaryKey(),

  hostName: text("host_name").notNull(),
  hostToken: text("host_token").notNull(),

  guestName: text("guest_name"),
  guestToken: text("guest_token"),

  hostPosition: integer("host_position").notNull().default(1),
  guestPosition: integer("guest_position").notNull().default(1),

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