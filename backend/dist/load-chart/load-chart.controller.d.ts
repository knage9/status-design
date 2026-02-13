import { LoadChartService } from './load-chart.service';
export declare class LoadChartController {
    private readonly loadChartService;
    constructor(loadChartService: LoadChartService);
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
            status: import(".prisma/client").WorkOrderStatus;
        }[]>;
    }>;
}
