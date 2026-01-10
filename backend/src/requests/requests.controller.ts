import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request, Query } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { Prisma, RequestStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { buildCurrentUser } from '../auth/permissions';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Post()
    create(@Body() createRequestDto: Prisma.RequestCreateInput) {
        return this.requestsService.create(createRequestDto);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    findAllAdmin(
        @Request() req, 
        @Query('searchQuery') searchQuery?: string,
        @Query('status') status?: string,
        @Query('dateFrom') dateFrom?: string,
        @Query('dateTo') dateTo?: string
    ) {
        return this.requestsService.findAll(
            buildCurrentUser(req.user),
            searchQuery,
            status,
            dateFrom,
            dateTo
        );
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    findOne(@Param('id') id: string, @Request() req) {
        return this.requestsService.findOne(+id, buildCurrentUser(req.user));
    }

    @Patch('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    update(@Param('id') id: string, @Body() updateRequestDto: Prisma.RequestUpdateInput) {
        return this.requestsService.update(+id, updateRequestDto);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.requestsService.remove(+id);
    }

    // Изменение статуса заявки (только MANAGER)
    @Patch(':id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('MANAGER', 'ADMIN')
    changeStatus(
        @Param('id') id: string,
        @Request() req,
        @Body() body: { status: 'SDELKA' | 'OTKLONENO'; managerComment: string; arrivalDate?: string }
    ) {
        return this.requestsService.changeStatus(
            +id,
            buildCurrentUser(req.user),
            body.status,
            {
                managerComment: body.managerComment,
                arrivalDate: body.arrivalDate ? new Date(body.arrivalDate) : undefined,
            }
        );
    }

    // Workflow endpoints (старые для обратной совместимости)
    @Post('admin/:id/take-to-work')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    takeToWork(@Param('id') id: string, @Request() req) {
        return this.requestsService.takeToWork(+id, buildCurrentUser(req.user));
    }

    @Post('admin/:id/complete')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    complete(@Param('id') id: string) {
        return this.requestsService.complete(+id);
    }

    @Post('admin/:id/close')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    close(@Param('id') id: string) {
        return this.requestsService.close(+id);
    }
}
