"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrdersController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const work_orders_service_1 = require("./work-orders.service");
const jwt_auth_guard_1 = require("../auth/jwt-auth.guard");
const roles_guard_1 = require("../auth/roles.guard");
const roles_decorator_1 = require("../auth/roles.decorator");
const permissions_1 = require("../auth/permissions");
let WorkOrdersController = class WorkOrdersController {
    workOrdersService;
    constructor(workOrdersService) {
        this.workOrdersService = workOrdersService;
    }
    create(createDto, req) {
        console.log('Controller create called');
        console.log('User:', req.user);
        console.log('Payload:', createDto);
        const payload = { ...createDto };
        if (req.user.role === 'MASTER' && createDto.requestId) {
            delete payload.managerId;
            payload.masterId = req.user.userId;
        }
        else if (req.user.role === 'MASTER') {
            payload.masterId = req.user.userId;
            payload.managerId = createDto.managerId || req.user.userId;
        }
        else {
            payload.managerId = createDto.managerId || req.user.userId;
        }
        return this.workOrdersService.create(payload, (0, permissions_1.buildCurrentUser)(req.user));
    }
    findAll(req, view, search) {
        return this.workOrdersService.findAll((0, permissions_1.buildCurrentUser)(req.user), view, search);
    }
    findOne(id, req) {
        return this.workOrdersService.findOne(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
    async update(id, updateDto, req) {
        return this.workOrdersService.update(id, updateDto, (0, permissions_1.buildCurrentUser)(req.user));
    }
    delete(id) {
        return this.workOrdersService.delete(id);
    }
    assignMaster(id, masterId) {
        return this.workOrdersService.assignMaster(id, masterId);
    }
    assignExecutor(id, executorId) {
        return this.workOrdersService.assignExecutor(id, executorId);
    }
    startWork(id, req) {
        return this.workOrdersService.startWork(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
    submitForReview(id, req) {
        return this.workOrdersService.submitForReview(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
    approve(id, req) {
        return this.workOrdersService.approve(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
    requestRevision(id, req) {
        return this.workOrdersService.requestRevision(id, (0, permissions_1.buildCurrentUser)(req.user));
    }
    complete(id, body, req) {
        return this.workOrdersService.complete(id, (0, permissions_1.buildCurrentUser)(req.user), body.finalStage);
    }
    updateTaskStatus(id, assignmentId, body, req) {
        return this.workOrdersService.updateAssignmentStatus(id, assignmentId, body.status, (0, permissions_1.buildCurrentUser)(req.user));
    }
    addPhotoBefore(id, photoUrl) {
        return this.workOrdersService.addPhotoBefore(id, photoUrl);
    }
    addPhotoAfter(id, photoUrl) {
        return this.workOrdersService.addPhotoAfter(id, photoUrl);
    }
    async uploadPhoto(id, file) {
        if (!file) {
            throw new Error('No file uploaded');
        }
        const photoUrl = `/uploads/${file.filename}`;
        return this.workOrdersService.addPhotoAfter(id, photoUrl);
    }
    async deletePhoto(id, photoUrl) {
        return this.workOrdersService.deletePhoto(id, decodeURIComponent(photoUrl));
    }
};
exports.WorkOrdersController = WorkOrdersController;
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)('admin'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('view')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "delete", null);
__decorate([
    (0, common_1.Post)(':id/assign-master'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('masterId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "assignMaster", null);
__decorate([
    (0, common_1.Post)(':id/assign-executor'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('executorId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "assignExecutor", null);
__decorate([
    (0, common_1.Post)(':id/start'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER', 'EXECUTOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "startWork", null);
__decorate([
    (0, common_1.Post)(':id/submit-review'),
    (0, roles_decorator_1.Roles)('EXECUTOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "submitForReview", null);
__decorate([
    (0, common_1.Post)(':id/approve'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)(':id/request-revision'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "requestRevision", null);
__decorate([
    (0, common_1.Post)(':id/complete'),
    (0, roles_decorator_1.Roles)('ADMIN', 'MANAGER', 'MASTER'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "complete", null);
__decorate([
    (0, common_1.Patch)(':id/tasks/:assignmentId/status'),
    (0, roles_decorator_1.Roles)('EXECUTOR'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('assignmentId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __param(3, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, Object, Object]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "updateTaskStatus", null);
__decorate([
    (0, common_1.Post)(':id/photos/before'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('photoUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "addPhotoBefore", null);
__decorate([
    (0, common_1.Post)(':id/photos/after'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)('photoUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", void 0)
], WorkOrdersController.prototype, "addPhotoAfter", null);
__decorate([
    (0, common_1.Post)(':id/photos/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                return cb(null, `${randomName}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
        fileFilter: (req, file, cb) => {
            const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
            if (allowedMimes.includes(file.mimetype)) {
                cb(null, true);
            }
            else {
                cb(new Error('Invalid file type. Only JPG, PNG, and WebP are allowed.'), false);
            }
        },
        limits: {
            fileSize: 5 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "uploadPhoto", null);
__decorate([
    (0, common_1.Delete)(':id/photos/:photoUrl'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('photoUrl')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, String]),
    __metadata("design:returntype", Promise)
], WorkOrdersController.prototype, "deletePhoto", null);
exports.WorkOrdersController = WorkOrdersController = __decorate([
    (0, common_1.Controller)('work-orders'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [work_orders_service_1.WorkOrdersService])
], WorkOrdersController);
//# sourceMappingURL=work-orders.controller.js.map