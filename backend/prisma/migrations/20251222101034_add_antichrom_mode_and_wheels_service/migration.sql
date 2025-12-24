/*
  Warnings:

  - You are about to drop the column `isAntichromWithoutMounting` on the `WorkOrder` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "isAntichromWithoutMounting",
ADD COLUMN     "antichromMode" TEXT NOT NULL DEFAULT 'PERCENT_20',
ADD COLUMN     "diskPaintingExecutorAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "diskPaintingExecutorId" INTEGER,
ADD COLUMN     "diskPaintingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "isDiskPainting" BOOLEAN NOT NULL DEFAULT false;
