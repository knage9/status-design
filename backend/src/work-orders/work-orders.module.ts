import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrderNumberService } from './work-order-number.service';
import { PrismaModule } from '../prisma/prisma.module';
import { WorkOrderHistoryModule } from '../work-order-history/work-order-history.module';

@Module({
    imports: [PrismaModule, WorkOrderHistoryModule],
    controllers: [WorkOrdersController],
    providers: [WorkOrdersService, WorkOrderNumberService],
    exports: [WorkOrdersService],
})
export class WorkOrdersModule { }
