import { PrismaService } from '../prisma/prisma.service';
import { CurrentUser } from '../auth/permissions';
export declare class WorkOrderHistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    getHistory(workOrderId: number, currentUser: CurrentUser): Promise<({
        user: {
            id: number;
            name: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: number;
        createdAt: Date;
        workOrderId: number;
        userId: number;
        action: string;
        details: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    logAction(workOrderId: number, userId: number, action: string, details: any): Promise<{
        id: number;
        createdAt: Date;
        workOrderId: number;
        userId: number;
        action: string;
        details: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
