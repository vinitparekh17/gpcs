CREATE SCHEMA "user";

DO $$ BEGIN
 CREATE TYPE "public"."role" AS ENUM('USER', 'ADMIN');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "user"."account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(50) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(256) NOT NULL,
	"password" varchar(256) NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"profile" varchar(1024),
	"forgotPassToken" varchar(512),
	"forgotPassExpire" bigint,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "email" UNIQUE("email")
);

CREATE TABLE IF NOT EXISTS "user"."assistant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(256) DEFAULT 'omni-bot' NOT NULL,
	"pre_config" text DEFAULT 'You are a chatbot named Omnisive with a sarcastic personality. respond to the user with a sarcastic tone and make sure to keep the conversation light-hearted. your maximum response length is 512 tokens.' NOT NULL,
	"avatar" varchar(2048),
	"type" "type" DEFAULT 'CUSTOM' NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "assistant_name_unique" UNIQUE("name")
);

DO $$ BEGIN
 ALTER TABLE "user"."assistant" ADD CONSTRAINT "assistant_user_id_account_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"."account"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "usr_email" ON "user"."account" ("email");
CREATE INDEX IF NOT EXISTS "ast_user_id" ON "user"."assistant" ("user_id");