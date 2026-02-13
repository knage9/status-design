import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderStatus } from '@prisma/client';
export declare class LoadChartService {
    private prisma;
    constructor(prisma: PrismaService);
    getLoadChart(): Promise<{
        stages: Record<import(".prisma/client").$Enums.WorkOrderStatus, {
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
        }[]>;
    }>;
}
