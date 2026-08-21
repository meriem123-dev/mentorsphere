-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "aiSummaryCache" JSONB,
ADD COLUMN     "aiSummaryGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "mentorMatchesCache" JSONB,
ADD COLUMN     "mentorMatchesGeneratedAt" TIMESTAMP(3);
