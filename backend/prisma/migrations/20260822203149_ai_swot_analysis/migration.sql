-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "swotAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "swotCache" JSONB,
ADD COLUMN     "swotGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "swotWindowStart" TIMESTAMP(3);
