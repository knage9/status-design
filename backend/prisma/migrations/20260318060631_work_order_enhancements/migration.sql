/*
  Warnings:

  - The values [ASSIGNED_TO_MASTER,ASSIGNED_TO_EXECUTOR,UNDER_REVIEW,APPROVED,RETURNED_FOR_REVISION,COMPLETED,SHIPPED,ASSEMBLED,ISSUED,PAINTING,POLISHING,ASSEMBLY_STAGE,SENT] on the enum `WorkOrderStatus` will be removed. If these variants are still used in the database, this will fail.
  - Made the column `status` on table `Request` required. This step will fail if there are existing NULL values in that column.

*/
-- CreateEnum
CREATE TYPE "TicketType" AS ENUM ('CAR', 'DETAILS');

-- AlterEnum
BEGIN;
CREATE TYPE "WorkOrderStatus_new" AS ENUM ('NEW', 'IN_DEAL', 'IN_PROGRESS', 'IN_PAINTING', 'PAINTED', 'POLISHED', 'PACKAGING', 'READY', 'DELIVERED');
ALTER TABLE "WorkOrder" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE "WorkOrderStatus_new" USING ("status"::text::"WorkOrderStatus_new");
ALTER TYPE "WorkOrderStatus" RENAME TO "WorkOrderStatus_old";
ALTER TYPE "WorkOrderStatus_new" RENAME TO "WorkOrderStatus";
DROP TYPE "WorkOrderStatus_old";
ALTER TABLE "WorkOrder" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "PortfolioItem" ALTER COLUMN "description" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Request" ALTER COLUMN "status" SET NOT NULL;

-- AlterTable
ALTER TABLE "WorkOrder" ADD COLUMN     "deliveryDate" TIMESTAMP(3),
ADD COLUMN     "ticketType" "TicketType" NOT NULL DEFAULT 'CAR';

-- CreateTable
CREATE TABLE "WorkOrderHistory" (
    "id" SERIAL NOT NULL,
    "workOrderId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkOrderHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WorkOrderHistory_workOrderId_idx" ON "WorkOrderHistory"("workOrderId");

-- CreateIndex
CREATE INDEX "WorkOrderHistory_userId_idx" ON "WorkOrderHistory"("userId");

-- AddForeignKey
ALTER TABLE "WorkOrderHistory" ADD CONSTRAINT "WorkOrderHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrderHistory" ADD CONSTRAINT "WorkOrderHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
