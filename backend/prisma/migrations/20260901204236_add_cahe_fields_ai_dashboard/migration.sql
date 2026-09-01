-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "dashboardSuggestionsAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "dashboardSuggestionsCache" JSONB,
ADD COLUMN     "dashboardSuggestionsGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "dashboardSuggestionsWindowStart" TIMESTAMP(3);
