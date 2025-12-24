import { Module } from '@nestjs/common';
import { ExecutorStatsController } from './executor-stats.controller';
import { ExecutorStatsService } from './executor-stats.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [ExecutorStatsController],
    providers: [ExecutorStatsService],
    exports: [ExecutorStatsService],
})
export class ExecutorStatsModule { }
