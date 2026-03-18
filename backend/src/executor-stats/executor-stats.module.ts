import { Module } from '@nestjs/common';
import { ExecutorStatsService } from './executor-stats.service';
import { ExecutorStatsController } from './executor-stats.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ExecutorStatsService],
  controllers: [ExecutorStatsController]
})
export class ExecutorStatsModule {}
