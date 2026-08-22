-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "aiChatAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiChatHistory" JSONB,
ADD COLUMN     "aiChatWindowStart" TIMESTAMP(3);
