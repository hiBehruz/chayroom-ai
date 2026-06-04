ALTER TABLE "subscriptions" ADD COLUMN "tribute_subscription_id" integer;
ALTER TABLE "subscriptions" ADD COLUMN "period" text;
ALTER TABLE "subscriptions" ADD COLUMN "cancelled_at" timestamp;
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_tribute_subscription_id_unique" UNIQUE ("tribute_subscription_id");
