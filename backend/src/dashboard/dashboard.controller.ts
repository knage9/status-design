import { Controller, Get, Param, Query, Patch, Body } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) { }

    @Get()
    async getDashboardData() {
        return this.dashboardService.getDashboardStats();
    }

    @Get('executor-stats')
    async getExecutorStats(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('serviceType') serviceType?: string,
        @Query('executorId') executorId?: string
    ) {
        return this.dashboardService.getExecutorStats(
            startDate,
            endDate,
            serviceType,
            executorId ? parseInt(executorId) : undefined
        );
    }

    @Get('load-chart')
    async getLoadChart() {
        return this.dashboardService.getLoadChart();
    }

    @Patch('update-payment/:id')
    async updatePayment(
        @Param('id') id: string,
        @Body('paidAmount') paidAmount: number,
        @Body('isPaid') isPaid: boolean
    ) {
        return this.dashboardService.updateExecutorPayment(
            parseInt(id),
            paidAmount,
            isPaid
        );
    }
}
