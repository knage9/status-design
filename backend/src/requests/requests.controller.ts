import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RequestsService } from './requests.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('requests')
export class RequestsController {
    constructor(private readonly requestsService: RequestsService) { }

    @Post()
    create(@Body() createRequestDto: Prisma.RequestCreateInput) {
        return this.requestsService.create(createRequestDto);
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard)
    findAllAdmin(@Request() req) {
        return this.requestsService.findAllAdmin(req.user.userId, req.user.role);
    }

    @Get(':id')
    @UseGuards(JwtAuthGuard)
    findOne(@Param('id') id: string) {
        return this.requestsService.findOne(+id);
    }

    @Patch('admin/:id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() updateRequestDto: Prisma.RequestUpdateInput) {
        return this.requestsService.update(+id, updateRequestDto);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.requestsService.remove(+id);
    }

    // Workflow endpoints
    @Post('admin/:id/take-to-work')
    @UseGuards(JwtAuthGuard)
    takeToWork(@Param('id') id: string, @Request() req) {
        return this.requestsService.takeToWork(+id, req.user.userId);
    }

    @Post('admin/:id/complete')
    @UseGuards(JwtAuthGuard)
    complete(@Param('id') id: string) {
        return this.requestsService.complete(+id);
    }

    @Post('admin/:id/close')
    @UseGuards(JwtAuthGuard)
    close(@Param('id') id: string) {
        return this.requestsService.close(+id);
    }
}
