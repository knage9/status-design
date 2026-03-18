import { Controller, Get, Query, UseGuards, Request, BadRequestException } from '@nestjs/common';
import { ExecutorStatsService } from './executor-stats.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { buildCurrentUser } from '../auth/permissions';

@Controller('executor-stats')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ExecutorStatsController {
    constructor(private readonly statsService: ExecutorStatsService) {}

    @Get('earnings')
    async getEarnings(
        @Request() req,
        @Query('startDate') startDateString: string,
        @Query('endDate') endDateString: string,
    ) {
        if (!startDateString || !endDateString) {
            throw new BadRequestException('Необходимо указать startDate и endDate');
        }

        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            throw new BadRequestException('Некорректный формат дат');
        }

        return this.statsService.getEarnings(startDate, endDate, buildCurrentUser(req.user));
    }
}
