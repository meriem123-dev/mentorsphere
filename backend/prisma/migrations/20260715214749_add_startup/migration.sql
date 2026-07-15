-- CreateEnum
CREATE TYPE "ProjectStage" AS ENUM ('IDEE', 'MVP', 'SEED', 'CROISSANCE');

-- AlterTable
ALTER TABLE "Mentorship" ADD COLUMN     "startupId" TEXT;

-- CreateTable
CREATE TABLE "Startup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "stage" "ProjectStage" NOT NULL DEFAULT 'IDEE',
    "domain" TEXT NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isRecruiting" BOOLEAN NOT NULL DEFAULT false,
    "needs" TEXT[],
    "entrepreneurId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Startup_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Mentorship" ADD CONSTRAINT "Mentorship_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Startup" ADD CONSTRAINT "Startup_entrepreneurId_fkey" FOREIGN KEY ("entrepreneurId") REFERENCES "Entrepreneur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
