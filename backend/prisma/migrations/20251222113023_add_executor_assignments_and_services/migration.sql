-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('ANTICHROME', 'CARBON', 'FILM', 'WHEEL_PAINTING', 'DRY_CLEANING', 'POLISHING');

-- CreateEnum
CREATE TYPE "WorkType" AS ENUM ('ARMATURA_DISMANTLING', 'ARMATURA_DISASSEMBLY', 'ARMATURA_ASSEMBLY', 'ARMATURA_MOUNTING', 'ARMATURA_ADDITIONAL', 'FIXED_BRAKE_CALIPERS_REMOVE', 'FIXED_BRAKE_CALIPERS_INSTALL', 'FIXED_WHEELS_REMOVE', 'FIXED_WHEELS_INSTALL', 'BODY_PART', 'SERVICE_FILM', 'SERVICE_DRY_CLEANING', 'SERVICE_POLISHING', 'SERVICE_WHEEL_PAINTING', 'SERVICE_CARBON');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "WorkOrderStatus" ADD VALUE 'PAINTING';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'POLISHING';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'ASSEMBLY_STAGE';
ALTER TYPE "WorkOrderStatus" ADD VALUE 'SENT';

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "services" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "bodyPartsData" JSONB DEFAULT '{}',
ADD COLUMN     "servicesData" JSONB DEFAULT '{}';

-- CreateTable
CREATE TABLE "WorkOrderExecutor" (
    "id" SERIAL NOT NULL,
    "workOrderId" INTEGER NOT NULL,
    "executorId" INTEGER NOT NULL,
    "workType" "WorkType" NOT NULL,
    "serviceType" "ServiceType",
    "description" TEXT,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isPaid" BOOLEAN NOT NULL DEFAULT false,
    "paidAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metadata" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrderExecutor_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrderExecutor_workOrderId_idx" ON "WorkOrderExecutor"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderExecutor_executorId_idx" ON "WorkOrderExecutor"("executorId");

-- AddForeignKey
ALTER TABLE "WorkOrderExecutor" ADD CONSTRAINT "WorkOrderExecutor_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderExecutor" ADD CONSTRAINT "WorkOrderExecutor_executorId_fkey" FOREIGN KEY ("executorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
