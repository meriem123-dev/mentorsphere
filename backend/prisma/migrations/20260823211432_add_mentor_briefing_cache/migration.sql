-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "mentorBriefingAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mentorBriefingCache" JSONB,
ADD COLUMN     "mentorBriefingGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "mentorBriefingWindowStart" TIMESTAMP(3);
