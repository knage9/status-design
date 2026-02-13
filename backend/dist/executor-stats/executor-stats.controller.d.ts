import { ExecutorStatsService } from './executor-stats.service';
export declare class ExecutorStatsController {
    private readonly executorStatsService;
    constructor(executorStatsService: ExecutorStatsService);
    getAllStats(): Promise<{
        executor: {
            id: number;
            name: string;
            email: string;
        };
        totalEarned: number;
        paidAmount: number;
        remaining: number;
        serviceBreakdown: Record<string, {
            count: number;
            amount: number;
        }>;
        workOrdersCount: number;
    }[]>;
    getExecutorDetails(executorId: string): Promise<{
        works: {
            id: number;
            workOrderId: number;
            workOrderNumber: string;
            workType: import(".prisma/client").$Enums.WorkType;
            serviceType: import(".prisma/client").$Enums.ServiceType | null;
            description: string | null;
            amount: number;
            isPaid: boolean;
            paidAmount: number;
            createdAt: Date;
            carModel: string;
            customerName: string;
            managerName: string;
        }[];
    }>;
    updatePayment(executorId: string, workOrderId: string, body: {
        paidAmount: number;
    }): Promise<{
        success: boolean;
        workOrderId: number;
        executorId: number;
        paidAmount: number;
    }>;
}
