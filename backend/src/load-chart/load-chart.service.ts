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

        const stages: Record<
            WorkOrderStatus,
            Array<{
                id: number;
                orderNumber: string;
                carBrand: string;
                carModel: string;
                vin?: string | null;
                customerName: string;
                executorName?: string;
                masterName?: string;
                managerName?: string;
                totalAmount: number;
                createdAt: Date;
                startedAt?: Date | null;
                completedAt?: Date | null;
                status: WorkOrderStatus;
            }>
        > = {} as any;

        const allStatuses = Object.values(WorkOrderStatus);
        allStatuses.forEach((status) => {
            stages[status] = [];
        });

        workOrders.forEach((wo) => {
            if (!stages[wo.status]) {
                stages[wo.status] = [];
            }

            stages[wo.status].push({
                id: wo.id,
                orderNumber: wo.orderNumber,
                carBrand: wo.carBrand || '',
                carModel: wo.carModel || '',
                vin: wo.vin,
                customerName: wo.customerName,
                executorName: wo.executor?.name,
                masterName: wo.master?.name,
                managerName: wo.manager?.name,
                totalAmount: wo.totalAmount,
                createdAt: wo.createdAt,
                startedAt: wo.startedAt,
                completedAt: wo.completedAt,
                status: wo.status,
            });
        });

        return { stages };
    }
}
