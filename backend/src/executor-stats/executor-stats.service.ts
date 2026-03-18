import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/permissions';
import { WorkOrderStatus } from '@prisma/client';

@Injectable()
export class ExecutorStatsService {
    constructor(private prisma: PrismaService) {}

    async getEarnings(startDate: Date, endDate: Date, currentUser: CurrentUser) {
        if (!currentUser || !currentUser.id) {
            throw new ForbiddenException('Пользователь не идентифицирован');
        }

        // Мы ищем выплаты только для текущего пользователя по завершенным заказ-нарядам
        const assignments = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: currentUser.id,
                workOrder: {
                    status: WorkOrderStatus.DELIVERED,
                    // Можно использовать completedAt для фильтрации по дате завершения
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
}
