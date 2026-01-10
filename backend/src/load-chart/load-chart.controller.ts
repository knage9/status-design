import { Controller, Get, UseGuards } from '@nestjs/common';
import { LoadChartService } from './load-chart.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('load-chart')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LoadChartController {
    constructor(private readonly loadChartService: LoadChartService) { }

    @Get()
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    async getLoadChart() {
        return this.loadChartService.getLoadChart();
    }
}
