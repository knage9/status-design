import { ExecutorStatsService } from './executor-stats.service';
export declare class ExecutorStatsController {
    private readonly statsService;
    constructor(statsService: ExecutorStatsService);
    getEarnings(req: any, startDateString: string, endDateString: string): Promise<{
        totalEarned: number;
        assignments: {
            id: number;
            amount: number;
            description: string | null;
            workType: import(".prisma/client").$Enums.WorkType;
            workOrder: {
                id: number;
                orderNumber: string;
                carText: string;
                completedAt: Date | null;
            };
        }[];
    }>;
}
