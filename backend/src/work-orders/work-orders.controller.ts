import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    ParseIntPipe,
    UseGuards,
    Request,
    Query,
} from '@nestjs/common';
import { WorkOrdersService } from './work-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
    constructor(private readonly workOrdersService: WorkOrdersService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER')
    create(@Body() createDto: any, @Request() req) {
        console.log('Controller create called');
        console.log('User:', req.user);
        console.log('Payload:', createDto);
        return this.workOrdersService.create({
            ...createDto,
            managerId: req.user.userId,
        });
    }

    @Get('admin')
    findAll(@Request() req, @Query('view') view?: string) {
        return this.workOrdersService.findAll(req.user.userId, req.user.role, view);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.findOne(id);
    }

    @Patch(':id')
    @Roles('ADMIN', 'MANAGER')
    update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any) {
        return this.workOrdersService.update(id, updateDto);
    }

    @Delete(':id')
    @Roles('ADMIN')
    delete(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.delete(id);
    }

    // Assignment endpoints
    @Post(':id/assign-master')
    @Roles('ADMIN', 'MANAGER')
    assignMaster(
        @Param('id', ParseIntPipe) id: number,
        @Body('masterId', ParseIntPipe) masterId: number,
    ) {
        return this.workOrdersService.assignMaster(id, masterId);
    }

    @Post(':id/assign-executor')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    assignExecutor(
        @Param('id', ParseIntPipe) id: number,
        @Body('executorId', ParseIntPipe) executorId: number,
    ) {
        return this.workOrdersService.assignExecutor(id, executorId);
    }

    // Workflow endpoints
    @Post(':id/start')
    @Roles('ADMIN', 'MASTER', 'EXECUTOR')
    startWork(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.startWork(id);
    }

    @Post(':id/submit-review')
    @Roles('ADMIN', 'EXECUTOR')
    submitForReview(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.submitForReview(id);
    }

    @Post(':id/approve')
    @Roles('ADMIN', 'MANAGER')
    approve(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.approve(id);
    }

    @Post(':id/request-revision')
    @Roles('ADMIN', 'MANAGER')
    requestRevision(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.requestRevision(id);
    }

    @Post(':id/complete')
    @Roles('ADMIN', 'MANAGER')
    complete(@Param('id', ParseIntPipe) id: number) {
        return this.workOrdersService.complete(id);
    }

    // Photo endpoints
    @Post(':id/photos/before')
    addPhotoBefore(
        @Param('id', ParseIntPipe) id: number,
        @Body('photoUrl') photoUrl: string,
    ) {
        return this.workOrdersService.addPhotoBefore(id, photoUrl);
    }

    @Post(':id/photos/after')
    addPhotoAfter(
        @Param('id', ParseIntPipe) id: number,
        @Body('photoUrl') photoUrl: string,
    ) {
        return this.workOrdersService.addPhotoAfter(id, photoUrl);
    }
}
