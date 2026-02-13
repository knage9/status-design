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
let ExecutorStatsService = class ExecutorStatsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAllExecutorStats() {
        const executors = await this.prisma.user.findMany({
            where: {
                role: { in: ['EXECUTOR', 'PAINTER'] },
                isActive: true,
            },
        });
        const stats = await Promise.all(executors.map(async (executor) => {
            const works = await this.prisma.workOrderExecutor.findMany({
                where: { executorId: executor.id },
                include: {
                    workOrder: {
                        select: {
                            id: true,
                            orderNumber: true,
                            status: true,
                        },
                    },
                },
            });
            const totalEarned = works.reduce((sum, w) => sum + w.amount, 0);
            const paidAmount = works.reduce((sum, w) => sum + w.paidAmount, 0);
            const serviceBreakdown = {};
            works.forEach((w) => {
                const key = w.serviceType || w.workType;
                if (!serviceBreakdown[key]) {
                    serviceBreakdown[key] = { count: 0, amount: 0 };
                }
                serviceBreakdown[key].count++;
                serviceBreakdown[key].amount += w.amount;
            });
            return {
                executor: {
                    id: executor.id,
                    name: executor.name,
                    email: executor.email,
                },
                totalEarned,
                paidAmount,
                remaining: totalEarned - paidAmount,
                serviceBreakdown,
                workOrdersCount: works.length,
            };
        }));
        return stats;
    }
    async getExecutorDetails(executorId) {
        const works = await this.prisma.workOrderExecutor.findMany({
            where: { executorId },
            include: {
                workOrder: {
                    include: {
                        request: true,
                        manager: { select: { name: true, email: true } },
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        return {
            works: works.map((w) => ({
                id: w.id,
                workOrderId: w.workOrderId,
                workOrderNumber: w.workOrder.orderNumber,
                workType: w.workType,
                serviceType: w.serviceType,
                description: w.description,
                amount: w.amount,
                isPaid: w.isPaid,
                paidAmount: w.paidAmount,
                createdAt: w.createdAt,
                carModel: w.workOrder.carModel,
                customerName: w.workOrder.customerName,
                managerName: w.workOrder.manager?.name,
            })),
        };
    }
    async updatePayment(workOrderId, executorId, paidAmount) {
        await this.prisma.workOrderExecutor.updateMany({
            where: {
                workOrderId,
                executorId,
            },
            data: {
                paidAmount,
                isPaid: true,
            },
        });
        return { success: true, workOrderId, executorId, paidAmount };
    }
};
exports.ExecutorStatsService = ExecutorStatsService;
exports.ExecutorStatsService = ExecutorStatsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ExecutorStatsService);
//# sourceMappingURL=executor-stats.service.js.map