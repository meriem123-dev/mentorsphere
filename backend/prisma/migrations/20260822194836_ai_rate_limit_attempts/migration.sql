-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "aiSummaryAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "aiSummaryWindowStart" TIMESTAMP(3),
ADD COLUMN     "mentorMatchesAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mentorMatchesWindowStart" TIMESTAMP(3);
