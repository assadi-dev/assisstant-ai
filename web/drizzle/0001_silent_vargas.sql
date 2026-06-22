CREATE TYPE "public"."ai_provider" AS ENUM('ollama', 'anthropic', 'openai', 'mistral');--> statement-breakpoint
ALTER TABLE "agent" ALTER COLUMN "model" SET DEFAULT 'llama3.1';--> statement-breakpoint
ALTER TABLE "agent" ADD COLUMN "provider" "ai_provider" DEFAULT 'ollama' NOT NULL;--> statement-breakpoint
ALTER TABLE "agent" ADD COLUMN "api_key" text;