CREATE TYPE "public"."access_level" AS ENUM('public', 'free', 'member');--> statement-breakpoint
ALTER TABLE "lessons" ALTER COLUMN "duration" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "tags" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "level_color" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "rating" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "participants" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "bg" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "dark" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "badge" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "accent_title" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "accent_color" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "courses" ADD COLUMN "is_free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "level" text;--> statement-breakpoint
ALTER TABLE "guides" ADD COLUMN "access_level" "access_level" DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "type" text DEFAULT 'Nazariy' NOT NULL;--> statement-breakpoint
ALTER TABLE "lessons" ADD COLUMN "free" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "subtitle" text;--> statement-breakpoint
ALTER TABLE "modules" ADD COLUMN "duration" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "tribute_subscription_id" integer;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "period" text;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp;--> statement-breakpoint
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tribute_subscription_id_unique" UNIQUE("tribute_subscription_id");