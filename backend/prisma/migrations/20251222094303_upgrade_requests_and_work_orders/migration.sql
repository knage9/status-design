-- AlterEnum
ALTER TYPE "RequestStatus" ADD VALUE 'SDELKA';

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'PAINTER';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkOrderStatus" ADD VALUE 'SHIPPED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'ASSEMBLED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'ISSUED';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'READY';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "comment" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "antichromArmatureAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "assemblyExecutorId" INTEGER,
ADD COLUMN     "badgesActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "badgesQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "badgesStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "carbonAssemblyExecutorId" INTEGER,
ADD COLUMN     "carbonComment" TEXT,
ADD COLUMN     "carbonDisassemblyExecutorId" INTEGER,
ADD COLUMN     "carbonDismantlingExecutorId" INTEGER,
ADD COLUMN     "carbonMountingExecutorId" INTEGER,
ADD COLUMN     "carbonPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "carbonQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "carbonType" TEXT,
ADD COLUMN     "cleaningExecutorAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "cleaningExecutorId" INTEGER,
ADD COLUMN     "cleaningPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "disassemblyExecutorId" INTEGER,
ADD COLUMN     "dismantlingExecutorId" INTEGER,
ADD COLUMN     "doorHandlesActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "doorHandlesQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "doorHandlesStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "extraPainterAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "fendersActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fendersQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fendersStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "filmExecutorAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "filmTeam" TEXT,
ADD COLUMN     "fogLightsActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fogLightsQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "fogLightsStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "hubCapsActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hubCapsQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "hubCapsStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "inscriptionsActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inscriptionsLetterCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inscriptionsQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "inscriptionsStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "isAntichromWithoutMounting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCarbon" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isCleaning" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isFilm" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "isPolishCeramic" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mountingExecutorId" INTEGER,
ADD COLUMN     "painterId" INTEGER,
ADD COLUMN     "polishCeramicExecutorAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "polishCeramicExecutorId" INTEGER,
ADD COLUMN     "polishCeramicPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "radiatorGrilleActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "radiatorGrilleQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "radiatorGrilleStatus" TEXT NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "railingsActualQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "railingsQty" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "railingsStatus" TEXT NOT NULL DEFAULT 'PENDING';

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_painterId_fkey" FOREIGN KEY ("painterId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
