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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkOrderHistoryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const permissions_1 = require("../auth/permissions");
let WorkOrderHistoryService = class WorkOrderHistoryService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getHistory(workOrderId, currentUser) {
        const canViewAll = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_ALL');
        let canViewOwn = false;
        const order = await this.prisma.workOrder.findUnique({
            where: { id: workOrderId },
            include: { executorAssignments: true }
        });
        if (!order) {
            return [];
        }
        if ((0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            if (currentUser.role === 'MASTER' && order.masterId === currentUser.id) {
                canViewOwn = true;
            }
            else if (currentUser.role === 'EXECUTOR') {
                const hasAssignment = order.executorAssignments?.some(a => a.executorId === currentUser.id) || false;
                canViewOwn = hasAssignment;
            }
            else if (order.managerId === currentUser.id) {
                canViewOwn = true;
            }
        }
        if (!canViewAll && !canViewOwn) {
            throw new common_1.ForbiddenException('Недостаточно прав для просмотра истории заказ-наряда');
        }
        return this.prisma.workOrderHistory.findMany({
            where: { workOrderId },
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
    async logAction(workOrderId, userId, action, details) {
        return this.prisma.workOrderHistory.create({
            data: {
                workOrderId,
                userId,
                action,
                details
            }
        });
    }
};
exports.WorkOrderHistoryService = WorkOrderHistoryService;
exports.WorkOrderHistoryService = WorkOrderHistoryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WorkOrderHistoryService);
//# sourceMappingURL=work-order-history.service.js.map