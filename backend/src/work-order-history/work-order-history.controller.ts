import { Controller, Get, Param, ParseIntPipe, UseGuards, Request } from '@nestjs/common';
import { WorkOrderHistoryService } from './work-order-history.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { buildCurrentUser } from '../auth/permissions';

@Controller('work-orders/:id/history')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrderHistoryController {
    constructor(private readonly historyService: WorkOrderHistoryService) {}

    @Get()
    getHistory(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.historyService.getHistory(id, buildCurrentUser(req.user));
    }
}
