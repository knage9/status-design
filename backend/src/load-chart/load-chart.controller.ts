import { Controller, Get } from '@nestjs/common';
import { LoadChartService } from './load-chart.service';

@Controller('load-chart')
export class LoadChartController {
    constructor(private readonly loadChartService: LoadChartService) { }

    @Get()
    async getLoadChart() {
        return this.loadChartService.getLoadChart();
    }
}
