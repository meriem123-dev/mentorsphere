-- CreateEnum
CREATE TYPE "JoinRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "ProjectJoinRequest" (
    "id" TEXT NOT NULL,
    "message" TEXT,
    "status" "JoinRequestStatus" NOT NULL DEFAULT 'PENDING',
    "startupId" TEXT NOT NULL,
    "requesterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProjectJoinRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ProjectJoinRequest_startupId_requesterId_key" ON "ProjectJoinRequest"("startupId", "requesterId");

-- AddForeignKey
ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_startupId_fkey" FOREIGN KEY ("startupId") REFERENCES "Startup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProjectJoinRequest" ADD CONSTRAINT "ProjectJoinRequest_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Entrepreneur"("id") ON DELETE CASCADE ON UPDATE CASCADE;
