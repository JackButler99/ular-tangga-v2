CREATE TABLE "game_rooms" (
	"code" text PRIMARY KEY NOT NULL,
	"host_name" text NOT NULL,
	"host_token" text NOT NULL,
	"guest_name" text,
	"guest_token" text,
	"host_position" integer DEFAULT 1 NOT NULL,
	"guest_position" integer DEFAULT 1 NOT NULL,
	"turn" text DEFAULT 'host' NOT NULL,
	"status" text DEFAULT 'waiting' NOT NULL,
	"winner" text,
	"last_roll" integer,
	"challenge" text,
	"history" text DEFAULT '[]' NOT NULL,
	"version" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
