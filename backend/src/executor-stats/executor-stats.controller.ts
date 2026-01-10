import { Controller, Get, Param, Patch, Body, UseGuards } from '@nestjs/common';
import { ExecutorStatsService } from './executor-stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('executor-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExecutorStatsController {
    constructor(private readonly executorStatsService: ExecutorStatsService) { }

    @Get()
    @Roles('ADMIN', 'MANAGER')
    async getAllStats() {
        return this.executorStatsService.getAllExecutorStats();
    }

    @Get(':executorId')
    @Roles('ADMIN', 'MANAGER')
    async getExecutorDetails(@Param('executorId') executorId: string) {
        return this.executorStatsService.getExecutorDetails(+executorId);
    }

    @Patch(':executorId/work-order/:workOrderId/payment')
    @Roles('ADMIN', 'MANAGER')
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
