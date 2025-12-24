import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';

@Injectable()
export class LoadChartService {
    constructor(private prisma: PrismaService) { }

    /**
     * Получить данные для графика загрузки
     * Группирует заказ-наряды по статусам (этапам работ)
     */
    async getLoadChart() {
        const workOrders = await this.prisma.workOrder.findMany({
            include: {
                executor: { select: { id: true, name: true } },
                master: { select: { id: true, name: true } },
                manager: { select: { id: true, name: true } },
            },
            orderBy: { createdAt: 'desc' },
        });

        // Группировка по статусам
        const stages: Record<
            WorkOrderStatus,
            Array<{
                id: number;
                orderNumber: string;
                carBrand: string;
                carModel: string;
                customerName: string;
                executorName?: string;
                masterName?: string;
                managerName?: string;
                totalAmount: number;
                createdAt: Date;
                status: WorkOrderStatus;
            }>
        > = {} as any;

        // Инициализировать все возможные статусы пустыми массивами
        const allStatuses: WorkOrderStatus[] = [
            'NEW',
            'ASSIGNED_TO_MASTER',
            'ASSIGNED_TO_EXECUTOR',
            'IN_PROGRESS',
            'PAINTING',
            'POLISHING',
            'ASSEMBLY_STAGE',
            'UNDER_REVIEW',
            'APPROVED',
            'RETURNED_FOR_REVISION',
            'SENT',
            'SHIPPED',
            'ASSEMBLED',
            'ISSUED',
            'READY',
            'COMPLETED',
        ];

        allStatuses.forEach((status) => {
            stages[status] = [];
        });

        // Заполнить данными
        workOrders.forEach((wo) => {
            if (!stages[wo.status]) {
                stages[wo.status] = [];
            }
            stages[wo.status].push({
                id: wo.id,
                orderNumber: wo.orderNumber,
                carBrand: wo.carBrand,
                carModel: wo.carModel,
                customerName: wo.customerName,
                executorName: wo.executor?.name,
                masterName: wo.master?.name,
                managerName: wo.manager?.name,
                totalAmount: wo.totalAmount,
                createdAt: wo.createdAt,
                status: wo.status,
            });
        });

        return { stages };
    }
}
