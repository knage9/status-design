import { Module } from '@nestjs/common';
import { LoadChartController } from './load-chart.controller';
import { LoadChartService } from './load-chart.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [LoadChartController],
    providers: [LoadChartService],
    exports: [LoadChartService],
})
export class LoadChartModule { }
