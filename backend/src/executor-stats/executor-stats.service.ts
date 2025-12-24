import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ExecutorStatsService {
    constructor(private prisma: PrismaService) { }

    /**
     * Получить статистику всех исполнителей (EXECUTOR и PAINTER)
     * Возвращает: заработано, выплачено, осталось, разбивку по услугам
     */
    async getAllExecutorStats() {
        // Получить всех исполнителей
        const executors = await this.prisma.user.findMany({
            where: {
                role: { in: ['EXECUTOR', 'PAINTER'] },
                isActive: true,
            },
        });

        // Для каждого исполнителя собрать статистику
        const stats = await Promise.all(
            executors.map(async (executor) => {
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

                // Разбивка по типам работ/услуг
                const serviceBreakdown: Record<
                    string,
                    { count: number; amount: number }
                > = {};
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
            }),
        );

        return stats;
    }

    /**
     * Получить детальную статистику одного исполнителя
     */
    async getExecutorDetails(executorId: number) {
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

    /**
     * Обновить выплату исполнителю по конкретному заказ-наряду
     */
    async updatePayment(
        workOrderId: number,
        executorId: number,
        paidAmount: number,
    ) {
        // Обновить все работы этого исполнителя в данном заказ-наряде
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
}
