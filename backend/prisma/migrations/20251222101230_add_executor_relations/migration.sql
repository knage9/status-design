-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_dismantlingExecutorId_fkey" FOREIGN KEY ("dismantlingExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_disassemblyExecutorId_fkey" FOREIGN KEY ("disassemblyExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_assemblyExecutorId_fkey" FOREIGN KEY ("assemblyExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_mountingExecutorId_fkey" FOREIGN KEY ("mountingExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_carbonDismantlingExecutorId_fkey" FOREIGN KEY ("carbonDismantlingExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_carbonDisassemblyExecutorId_fkey" FOREIGN KEY ("carbonDisassemblyExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_carbonAssemblyExecutorId_fkey" FOREIGN KEY ("carbonAssemblyExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_carbonMountingExecutorId_fkey" FOREIGN KEY ("carbonMountingExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_cleaningExecutorId_fkey" FOREIGN KEY ("cleaningExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_polishCeramicExecutorId_fkey" FOREIGN KEY ("polishCeramicExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_diskPaintingExecutorId_fkey" FOREIGN KEY ("diskPaintingExecutorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
