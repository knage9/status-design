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
exports.ExecutorStatsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let ExecutorStatsService = class ExecutorStatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getEarnings(startDate, endDate, currentUser) {
        if (!currentUser || !currentUser.id) {
            throw new common_1.ForbiddenException('Пользователь не идентифицирован');
        }
        const assignments = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: currentUser.id,
                workOrder: {
                    status: client_1.WorkOrderStatus.DELIVERED,
                    completedAt: {
                        gte: startDate,
                        lte: endDate,
                    }
                }
            },
            include: {
                workOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        completedAt: true,
                        carBrand: true,
                        carModel: true,
                    }
                }
            },
            orderBy: {
                workOrder: {
                    completedAt: 'desc'
                }
            }
        });
        const totalEarned = assignments.reduce((sum, current) => sum + (current.amount || 0), 0);
        return {
            totalEarned,
            assignments: assignments.map(a => ({
                id: a.id,
                amount: a.amount,
                description: a.description,
                workType: a.workType,
                workOrder: {
                    id: a.workOrder.id,
                    orderNumber: a.workOrder.orderNumber,
                    carText: `${a.workOrder.carBrand} ${a.workOrder.carModel}`,
                    completedAt: a.workOrder.completedAt
                }
            }))
        };
    }
};
exports.ExecutorStatsService = ExecutorStatsService;
exports.ExecutorStatsService = ExecutorStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExecutorStatsService);
//# sourceMappingURL=executor-stats.service.js.map