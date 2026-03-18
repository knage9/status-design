import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/permissions';
export declare class ExecutorStatsService {
    private prisma;
    constructor(prisma: PrismaService);
    getEarnings(startDate: Date, endDate: Date, currentUser: CurrentUser): Promise<{
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
