ALTER TYPE "WorkOrderStatus" RENAME TO "WorkOrderStatus_old";
CREATE TYPE "WorkOrderStatus" AS ENUM ('NEW', 'IN_DEAL', 'IN_PROGRESS', 'IN_PAINTING', 'PAINTED', 'POLISHED', 'PACKAGING', 'READY', 'DELIVERED');
ALTER TABLE "WorkOrder" ALTER COLUMN "status" DROP DEFAULT;

ALTER TABLE "WorkOrder" ALTER COLUMN "status" TYPE "WorkOrderStatus" USING (
  CASE 
    WHEN status::text = 'NEW' THEN 'NEW'::"WorkOrderStatus"
    WHEN status::text = 'ASSIGNED_TO_MASTER' THEN 'IN_PROGRESS'::"WorkOrderStatus"
    WHEN status::text = 'ASSIGNED_TO_EXECUTOR' THEN 'IN_PROGRESS'::"WorkOrderStatus"
    WHEN status::text = 'IN_PROGRESS' THEN 'IN_PROGRESS'::"WorkOrderStatus"
    WHEN status::text = 'PAINTING' THEN 'IN_PAINTING'::"WorkOrderStatus"
    WHEN status::text = 'POLISHING' THEN 'POLISHED'::"WorkOrderStatus"
    WHEN status::text = 'ASSEMBLY_STAGE' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'UNDER_REVIEW' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'APPROVED' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'RETURNED_FOR_REVISION' THEN 'IN_PROGRESS'::"WorkOrderStatus"
    WHEN status::text = 'SENT' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'SHIPPED' THEN 'DELIVERED'::"WorkOrderStatus"
    WHEN status::text = 'ASSEMBLED' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'ISSUED' THEN 'DELIVERED'::"WorkOrderStatus"
    WHEN status::text = 'READY' THEN 'READY'::"WorkOrderStatus"
    WHEN status::text = 'COMPLETED' THEN 'DELIVERED'::"WorkOrderStatus"
    ELSE 'NEW'::"WorkOrderStatus"
  END
);

ALTER TABLE "WorkOrder" ALTER COLUMN "status" SET DEFAULT 'NEW';
DROP TYPE "WorkOrderStatus_old";

-- Add TicketType enum and logic
CREATE TYPE "TicketType" AS ENUM ('CAR', 'DETAILS');
ALTER TABLE "WorkOrder" ADD COLUMN "ticketType" "TicketType" NOT NULL DEFAULT 'CAR';
ALTER TABLE "WorkOrder" ADD COLUMN "deliveryDate" timestamp(3) without time zone;

-- Create WorkOrderHistory table
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
CREATE INDEX "WorkOrderHistory_userId_idx" ON "WorkOrderHistory"("userId");

-- AddForeignKey
ALTER TABLE "WorkOrderHistory" ADD CONSTRAINT "WorkOrderHistory_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "WorkOrder"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkOrderHistory" ADD CONSTRAINT "WorkOrderHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
