import { Module } from '@nestjs/common';
import { WorkOrdersController } from './work-orders.controller';
import { WorkOrdersService } from './work-orders.service';
import { WorkOrderNumberService } from './work-order-number.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [WorkOrdersController],
    providers: [WorkOrdersService, WorkOrderNumberService],
    exports: [WorkOrdersService],
})
export class WorkOrdersModule { }
