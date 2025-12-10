/*
  Warnings:

  - You are about to drop the column `description` on the `WorkOrder` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `WorkOrder` table. All the data in the column will be lost.
  - Added the required column `carBrand` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carCondition` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `carModel` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerName` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `customerPhone` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentMethod` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `totalAmount` to the `WorkOrder` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "CarCondition" AS ENUM ('NEW', 'USED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'NON_CASH', 'WITHOUT_VAT');

-- CreateEnum
CREATE TYPE "WorkOrderStatus" AS ENUM ('NEW', 'ASSIGNED_TO_MASTER', 'ASSIGNED_TO_EXECUTOR', 'IN_PROGRESS', 'UNDER_REVIEW', 'APPROVED', 'RETURNED_FOR_REVISION', 'COMPLETED');

-- AlterTable
ALTER TABLE "WorkOrder" DROP COLUMN "description",
DROP COLUMN "title",
ADD COLUMN     "assembly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "assemblyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "badges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "blackCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "carBrand" TEXT NOT NULL,
ADD COLUMN     "carCondition" "CarCondition" NOT NULL,
ADD COLUMN     "carModel" TEXT NOT NULL,
ADD COLUMN     "carbonCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "customerName" TEXT NOT NULL,
ADD COLUMN     "customerPhone" TEXT NOT NULL,
ADD COLUMN     "diffuser" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disassembly" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "disassemblyPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "dismantling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "dismantlingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "doorHandles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "doorMoldings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fakeExhausts" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fenders" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "fogLights" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "frontBumper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hood" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "hubCaps" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "inscriptions" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lip" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mirrors" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mounting" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mountingPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "nozzles" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL,
ADD COLUMN     "photosAfterWork" TEXT[],
ADD COLUMN     "photosBeforeWork" TEXT[],
ADD COLUMN     "radiatorGrille" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "railings" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rearBumper" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "rearLights" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "sills" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "spoiler" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "standardStructureCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "startedAt" TIMESTAMP(3),
ADD COLUMN     "status" "WorkOrderStatus" NOT NULL DEFAULT 'NEW',
ADD COLUMN     "totalAmount" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "trunkLid" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vents" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "vin" TEXT,
ADD COLUMN     "wheels" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "windowMoldings" BOOLEAN NOT NULL DEFAULT false;
