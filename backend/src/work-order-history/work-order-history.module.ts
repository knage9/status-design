import { Module } from '@nestjs/common';
import { WorkOrderHistoryService } from './work-order-history.service';
import { WorkOrderHistoryController } from './work-order-history.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [WorkOrderHistoryService],
  controllers: [WorkOrderHistoryController],
  exports: [WorkOrderHistoryService]
})
export class WorkOrderHistoryModule {}
