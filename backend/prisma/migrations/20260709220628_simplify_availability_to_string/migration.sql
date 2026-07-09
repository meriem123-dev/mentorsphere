/*
  Warnings:

  - You are about to drop the column `dayOfWeek` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `endTime` on the `Availability` table. All the data in the column will be lost.
  - You are about to drop the column `startTime` on the `Availability` table. All the data in the column will be lost.
  - Added the required column `slot` to the `Availability` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Availability" DROP COLUMN "dayOfWeek",
DROP COLUMN "endTime",
DROP COLUMN "startTime",
ADD COLUMN     "slot" TEXT NOT NULL;

-- DropEnum
DROP TYPE "DayOfWeek";
