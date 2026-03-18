import { WorkOrderHistoryService } from './work-order-history.service';
export declare class WorkOrderHistoryController {
    private readonly historyService;
    constructor(historyService: WorkOrderHistoryService);
    getHistory(id: number, req: any): Promise<({
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
}
