/*
  Warnings:

  - You are about to drop the column `aiChatAttempts` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `aiChatHistory` on the `Mentorship` table. All the data in the column will be lost.
  - You are about to drop the column `aiChatWindowStart` on the `Mentorship` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mentorship" DROP COLUMN "aiChatAttempts",
DROP COLUMN "aiChatHistory",
DROP COLUMN "aiChatWindowStart";

-- CreateTable
CREATE TABLE "AIChatSession" (
    "id" TEXT NOT NULL,
    "mentorshipId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "history" JSONB NOT NULL DEFAULT '[]',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "windowStart" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AIChatSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AIChatSession_mentorshipId_userId_key" ON "AIChatSession"("mentorshipId", "userId");

-- AddForeignKey
ALTER TABLE "AIChatSession" ADD CONSTRAINT "AIChatSession_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "Mentorship"("id") ON DELETE CASCADE ON UPDATE CASCADE;
