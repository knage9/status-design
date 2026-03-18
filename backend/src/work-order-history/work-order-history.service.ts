import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser, hasPermission } from '../auth/permissions';

@Injectable()
export class WorkOrderHistoryService {
    constructor(private prisma: PrismaService) {}

    async getHistory(workOrderId: number, currentUser: CurrentUser) {
        // Basic check: user can view this work order's history if they can view the work order.
        const canViewAll = hasPermission(currentUser, 'WORK_ORDERS_VIEW_ALL');
        let canViewOwn = false;

        const order = await this.prisma.workOrder.findUnique({
            where: { id: workOrderId },
            include: { executorAssignments: true }
        });

        if (!order) {
            return [];
        }

        if (hasPermission(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            if (currentUser.role === 'MASTER' && order.masterId === currentUser.id) {
                canViewOwn = true;
            } else if (currentUser.role === 'EXECUTOR') {
                const hasAssignment = order.executorAssignments?.some(a => a.executorId === currentUser.id) || false;
                canViewOwn = hasAssignment;
            } else if (order.managerId === currentUser.id) {
                canViewOwn = true;
            }
        }

        if (!canViewAll && !canViewOwn) {
            throw new ForbiddenException('Недостаточно прав для просмотра истории заказ-наряда');
        }

        return this.prisma.workOrderHistory.findMany({
            where: { workOrderId },
            include: {
                user: { select: { id: true, name: true, role: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    async logAction(workOrderId: number, userId: number, action: string, details: any) {
        return this.prisma.workOrderHistory.create({
            data: {
                workOrderId,
                userId,
                action,
                details
            }
        });
    }
}
