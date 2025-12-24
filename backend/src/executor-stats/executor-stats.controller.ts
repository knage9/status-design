import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { ExecutorStatsService } from './executor-stats.service';

@Controller('executor-stats')
export class ExecutorStatsController {
    constructor(private readonly executorStatsService: ExecutorStatsService) { }

    @Get()
    async getAllStats() {
        return this.executorStatsService.getAllExecutorStats();
    }

    @Get(':executorId')
    async getExecutorDetails(@Param('executorId') executorId: string) {
        return this.executorStatsService.getExecutorDetails(+executorId);
    }

    @Patch(':executorId/work-order/:workOrderId/payment')
    async updatePayment(
        @Param('executorId') executorId: string,
        @Param('workOrderId') workOrderId: string,
        @Body() body: { paidAmount: number },
    ) {
        return this.executorStatsService.updatePayment(
            +workOrderId,
            +executorId,
            body.paidAmount,
        );
    }
}
