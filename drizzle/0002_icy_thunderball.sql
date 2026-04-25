CREATE TYPE "public"."service_status" AS ENUM('active', 'paused', 'archived');--> statement-breakpoint
ALTER TABLE "services" ADD COLUMN "status" "service_status" DEFAULT 'active' NOT NULL;