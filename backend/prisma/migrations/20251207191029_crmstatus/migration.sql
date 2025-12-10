/*
  Warnings:

  - The values [CONTACTED,CONVERTED,CANCELLED] on the enum `RequestStatus` will be removed. If these variants are still used in the database, this will fail.
  - A unique constraint covering the columns `[requestNumber]` on the table `Request` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `requestNumber` to the `Request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RequestStatus_new" AS ENUM ('NEW', 'IN_PROGRESS', 'COMPLETED', 'CLOSED');
ALTER TABLE "Request" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Request" ALTER COLUMN "status" TYPE "RequestStatus_new" USING ("status"::text::"RequestStatus_new");
ALTER TYPE "RequestStatus" RENAME TO "RequestStatus_old";
ALTER TYPE "RequestStatus_new" RENAME TO "RequestStatus";
DROP TYPE "RequestStatus_old";
ALTER TABLE "Request" ALTER COLUMN "status" SET DEFAULT 'NEW';
COMMIT;

-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "requestNumber" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Request_requestNumber_key" ON "Request"("requestNumber");
