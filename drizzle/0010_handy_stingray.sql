CREATE TABLE "device_binding" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"token_hash" char(64) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "device_binding_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "device_binding_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
ALTER TABLE "device_binding" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "device_binding" ADD CONSTRAINT "device_binding_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;