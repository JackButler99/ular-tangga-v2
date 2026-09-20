CREATE TABLE "room_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"room_code" text NOT NULL,
	"sender_role" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_messages" ADD CONSTRAINT "room_messages_room_code_game_rooms_code_fk" FOREIGN KEY ("room_code") REFERENCES "public"."game_rooms"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "room_messages_room_id_idx" ON "room_messages" USING btree ("room_code","id");