import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private readonly dashboardService;
    constructor(dashboardService: DashboardService);
    getDashboardData(): Promise<{
        stats: {
            reviews: {
                total: number;
                pending: number;
                avgRating: number;
                thisWeek: number;
            };
            posts: {
                total: number;
                draft: number;
                thisWeek: number;
            };
            portfolio: {
                total: number;
                draft: number;
                thisWeek: number;
            };
            requests: {
                total: number;
                new: number;
                thisWeek: number;
            };
        };
        pendingReviews: {
            rating: number;
            service: string;
            carBrand: string;
            carModel: string;
            text: string;
            dateCreated: Date;
            datePublished: Date | null;
            status: import(".prisma/client").$Enums.ReviewStatus;
            images: string[];
            servicesSelected: string[];
            tags: string[];
            id: number;
        }[];
        topServices: {
            service: string;
            count: number;
        }[];
        activityChart: {
            date: string;
            reviews: number;
            posts: number;
            portfolio: number;
        }[];
    }>;
    getExecutorStats(startDate?: string, endDate?: string, serviceType?: string, executorId?: string): Promise<{
        executor: {
            id: any;
            name: any;
            email: any;
        };
        totalEarned: any;
        paidAmount: any;
        remaining: number;
        workOrdersCount: number;
        serviceBreakdown: Record<string, {
            count: number;
            amount: number;
        }>;
        works: any;
    }[]>;
    getLoadChart(): Promise<{
        stages: Record<string, any[]>;
    }>;
    updatePayment(id: string, paidAmount: number, isPaid: boolean): Promise<{
        id: number;
        description: string | null;
        createdAt: Date;
        updatedAt: Date;
        executorId: number;
        workOrderId: number;
        workType: import(".prisma/client").$Enums.WorkType;
        serviceType: import(".prisma/client").$Enums.ServiceType | null;
        amount: number;
        isPaid: boolean;
        paidAmount: number;
        metadata: import("@prisma/client/runtime/library").JsonValue | null;
    }>;
    manager(userId?: string, req?: any): Promise<{
        stats: {
            newRequestsToday: number;
            dealsToday: number;
            activeWOCount: number;
            completedWOWeek: number;
        };
        statusStats: {
            status: "NOVA" | "SDELKA" | "OTKLONENO" | "ZAVERSHENA";
            count: number;
        }[];
        myRequests: {
            carModel: string;
            status: import(".prisma/client").$Enums.RequestStatus;
            id: number;
            name: string;
            phone: string;
            createdAt: Date;
            requestNumber: string;
        }[];
        activeWorkOrders: {
            carBrand: string;
            carModel: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            id: number;
            createdAt: Date;
            orderNumber: string;
            customerName: string;
            master: {
                name: string;
            } | null;
        }[];
    }>;
    master(userId?: string, req?: any): Promise<{
        executorStage: {
            totalTasks: number;
            doneTasks: number;
            timeSeconds: number;
            executors: string[];
            carBrand: string;
            carModel: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            id: number;
            createdAt: Date;
            orderNumber: string;
            customerName: string;
            executorAssignments: {
                id: number;
                executorId: number;
                executor: {
                    name: string;
                };
                metadata: import("@prisma/client/runtime/library").JsonValue;
            }[];
        }[];
        masterStage: {
            timeSeconds: number;
            executorsCount: number;
            carBrand: string;
            carModel: string;
            status: import(".prisma/client").$Enums.WorkOrderStatus;
            id: number;
            createdAt: Date;
            orderNumber: string;
            customerName: string;
            executorAssignments: {
                id: number;
                executorId: number;
                executor: {
                    name: string;
                };
                metadata: import("@prisma/client/runtime/library").JsonValue;
            }[];
        }[];
        stats: {
            executorStage: number;
            masterStage: number;
            completedToday: number;
            completedWeek: number;
        };
    }>;
    executor(userId?: string, req?: any): Promise<{
        activeWorkOrders: {
            workOrderId: number;
            orderNumber: string;
            customerName: string;
            car: string;
            status: string;
            total: number;
            done: number;
            myTimeSeconds: number;
        }[];
        tasksDone: {
            today: number;
            week: number;
        };
        timeTodaySeconds: number;
        history: {
            workOrderId: number;
            orderNumber: string;
            completedAt: Date | null | undefined;
            earned: number;
            timeSeconds: number;
            car: string;
        }[];
    }>;
}
