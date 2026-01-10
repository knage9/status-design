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
    UseInterceptors,
    UploadedFile,
    BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { WorkOrdersService } from './work-orders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { buildCurrentUser } from '../auth/permissions';

@Controller('work-orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WorkOrdersController {
    constructor(private readonly workOrdersService: WorkOrdersService) { }

    @Post()
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    create(@Body() createDto: any, @Request() req) {
        console.log('Controller create called');
        console.log('User:', req.user);
        console.log('Payload:', createDto);
        
        // Для MASTER: если передан requestId, НЕ передаем managerId - он будет взят из заявки в сервисе
        // Для MANAGER/ADMIN: используем их userId как managerId
        const payload: any = { ...createDto };
        
        if (req.user.role === 'MASTER' && createDto.requestId) {
            // Для мастера с requestId не передаем managerId - сервис возьмет его из заявки
            delete payload.managerId;
            // Устанавливаем masterId для мастера, который создает заказ-наряд
            payload.masterId = req.user.userId;
        } else if (req.user.role === 'MASTER') {
            // Если мастер создает заказ-наряд без requestId, устанавливаем его как masterId
            payload.masterId = req.user.userId;
            payload.managerId = createDto.managerId || req.user.userId;
        } else {
            // Для менеджера/админа устанавливаем их userId
            payload.managerId = createDto.managerId || req.user.userId;
        }
            
        return this.workOrdersService.create(payload, buildCurrentUser(req.user));
    }

    @Get('admin')
    findAll(@Request() req, @Query('view') view?: string, @Query('search') search?: string) {
        return this.workOrdersService.findAll(buildCurrentUser(req.user), view, search);
    }

    @Get(':id')
    findOne(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.workOrdersService.findOne(id, buildCurrentUser(req.user));
    }

    @Patch(':id')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: any, @Request() req) {
        return this.workOrdersService.update(id, updateDto, buildCurrentUser(req.user));
    }

    @Delete(':id')
    @Roles('ADMIN', 'MANAGER')
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
    @Roles('ADMIN', 'MANAGER', 'MASTER', 'EXECUTOR')
    startWork(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.workOrdersService.startWork(id, buildCurrentUser(req.user));
    }

    @Post(':id/submit-review')
    @Roles('EXECUTOR')
    submitForReview(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.workOrdersService.submitForReview(id, buildCurrentUser(req.user));
    }

    @Post(':id/approve')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    approve(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.workOrdersService.approve(id, buildCurrentUser(req.user));
    }

    @Post(':id/request-revision')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    requestRevision(@Param('id', ParseIntPipe) id: number, @Request() req) {
        return this.workOrdersService.requestRevision(id, buildCurrentUser(req.user));
    }

    @Post(':id/complete')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    complete(
        @Param('id', ParseIntPipe) id: number,
        @Body() body: { finalStage: 'ASSEMBLED' | 'SENT' | 'ISSUED' },
        @Request() req,
    ) {
        return this.workOrdersService.complete(id, buildCurrentUser(req.user), body.finalStage);
    }

    @Patch(':id/tasks/:assignmentId/status')
    @Roles('EXECUTOR')
    updateTaskStatus(
        @Param('id', ParseIntPipe) id: number,
        @Param('assignmentId', ParseIntPipe) assignmentId: number,
        @Body() body: { status: 'PENDING' | 'IN_PROGRESS' | 'DONE' },
        @Request() req,
    ) {
        return this.workOrdersService.updateAssignmentStatus(
            id,
            assignmentId,
            body.status,
            buildCurrentUser(req.user),
        );
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

    // Photo report endpoints
    @Post(':id/photos/upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            } else {
                cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
    }))
    async uploadPhoto(
        @Param('id', ParseIntPipe) id: number,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const photoUrl = `/uploads/${file.filename}`;
        return this.workOrdersService.addPhotoAfter(id, photoUrl);
    }

    @Delete(':id/photos/:photoUrl')
    async deletePhoto(
        @Param('id', ParseIntPipe) id: number,
        @Param('photoUrl') photoUrl: string,
    ) {
        return this.workOrdersService.deletePhoto(id, decodeURIComponent(photoUrl));
    }
}
