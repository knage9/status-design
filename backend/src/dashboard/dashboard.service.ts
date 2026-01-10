import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RequestStatus } from '@prisma/client';
import { WorkOrderStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    private todayRange() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        const end = new Date();
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    async getDashboardStats() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        // Reviews Stats
        const totalReviews = await this.prisma.review.count();
        const pendingReviewsCount = await this.prisma.review.count({
            where: { status: 'PENDING' },
        });
        const reviewsThisWeek = await this.prisma.review.count({
            where: { dateCreated: { gte: sevenDaysAgo } },
        });
        const avgRatingAgg = await this.prisma.review.aggregate({
            _avg: { rating: true },
        });
        const avgRating = avgRatingAgg._avg.rating || 0;

        // Posts Stats
        const totalPosts = await this.prisma.post.count();
        const draftPosts = await this.prisma.post.count({
            where: { status: 'DRAFT' },
        });
        const postsThisWeek = await this.prisma.post.count({
            where: { dateCreated: { gte: sevenDaysAgo } },
        });

        // Portfolio Stats
        const totalPortfolio = await this.prisma.portfolioItem.count();
        const draftPortfolio = await this.prisma.portfolioItem.count({
            where: { status: 'DRAFT' },
        });
        const portfolioThisWeek = await this.prisma.portfolioItem.count({
            where: { date: { gte: sevenDaysAgo } },
        });

        // Requests Stats
        const totalRequests = await this.prisma.request.count();
        const newRequests = await this.prisma.request.count({
            where: { status: RequestStatus.NOVA },
        });
        const requestsThisWeek = await this.prisma.request.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        // Pending Reviews List
        const pendingReviews = await this.prisma.review.findMany({
            where: { status: 'PENDING' },
            orderBy: { dateCreated: 'desc' },
        });

        // Top Services (Group By)
        // Prisma groupBy for 'service'
        const topServicesGrouped = await this.prisma.review.groupBy({
            by: ['service'],
            _count: {
                service: true,
            },
            orderBy: {
                _count: {
                    service: 'desc',
                },
            },
            take: 3,
        });

        const topServices = topServicesGrouped.map((item) => ({
            service: item.service,
            count: item._count.service,
        }));

        // Activity Chart (Last 7 days)
        // We need to aggregate counts per day.
        // Since Prisma doesn't support date truncation easily in groupBy without raw query,
        // and we only need last 7 days, we can fetch data or use raw query.
        // For simplicity and database independence (though using Postgres), let's fetch items from last 7 days and aggregate in JS.
        // Or simpler: execute 3 queries for reviews, posts, portfolio for last 7 days.

        const reviewsLast7Days = await this.prisma.review.findMany({
            where: { dateCreated: { gte: sevenDaysAgo } },
            select: { dateCreated: true },
        });
        const postsLast7Days = await this.prisma.post.findMany({
            where: { dateCreated: { gte: sevenDaysAgo } },
            select: { dateCreated: true },
        });
        const portfolioLast7Days = await this.prisma.portfolioItem.findMany({
            where: { date: { gte: sevenDaysAgo } },
            select: { date: true },
        });

        const activityChart: { date: string; reviews: number; posts: number; portfolio: number }[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0]; // YYYY-MM-DD

            const reviewsCount = reviewsLast7Days.filter(r => r.dateCreated.toISOString().startsWith(dateStr)).length;
            const postsCount = postsLast7Days.filter(p => p.dateCreated.toISOString().startsWith(dateStr)).length;
            const portfolioCount = portfolioLast7Days.filter(p => p.date.toISOString().startsWith(dateStr)).length;

            activityChart.push({
                date: dateStr,
                reviews: reviewsCount,
                posts: postsCount,
                portfolio: portfolioCount,
            });
        }

        return {
            stats: {
                reviews: {
                    total: totalReviews,
                    pending: pendingReviewsCount,
                    avgRating: Number(avgRating.toFixed(1)),
                    thisWeek: reviewsThisWeek,
                },
                posts: {
                    total: totalPosts,
                    draft: draftPosts,
                    thisWeek: postsThisWeek,
                },
                portfolio: {
                    total: totalPortfolio,
                    draft: draftPortfolio,
                    thisWeek: portfolioThisWeek,
                },
                requests: {
                    total: totalRequests,
                    new: newRequests,
                    thisWeek: requestsThisWeek,
                },
            },
            pendingReviews,
            topServices,
            activityChart,
        };
    }
    async getExecutorStats(startDate?: string, endDate?: string, serviceType?: string, executorId?: number) {
        const where: any = {};
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate) where.createdAt.gte = new Date(startDate);
            if (endDate) where.createdAt.lte = new Date(endDate);
        }
        if (serviceType) {
            where.serviceType = serviceType;
        }

        const userWhere: any = { role: { in: ['EXECUTOR', 'PAINTER'] } };
        if (executorId) {
            userWhere.id = executorId;
        }

        const executors = await this.prisma.user.findMany({
            where: userWhere,
            select: {
                id: true,
                name: true,
                email: true,
                role: true,

                // @ts-ignore
                assignedWorks: {
                    where,
                    include: {
                        workOrder: {
                            select: {
                                orderNumber: true,
                                carBrand: true,
                                carModel: true,
                                customerName: true,
                            }
                        }
                    }
                }
            }
        });



        return executors.map((executor: any) => {
            const totalEarned = executor.assignedWorks.reduce((sum, a) => sum + a.amount, 0);
            const totalPaid = executor.assignedWorks.reduce((sum, a) => sum + a.paidAmount, 0);
            const remaining = totalEarned - totalPaid;

            // Группировка по типам услуг для этого исполнителя
            const serviceBreakdown: Record<string, { count: number; amount: number }> = {};
            executor.assignedWorks.forEach(a => {
                const type = a.serviceType || 'OTHER';
                if (!serviceBreakdown[type]) {
                    serviceBreakdown[type] = { count: 0, amount: 0 };
                }
                serviceBreakdown[type].count++;
                serviceBreakdown[type].amount += a.amount;
            });

            return {
                executor: {
                    id: executor.id,
                    name: executor.name,
                    email: executor.email,
                },
                totalEarned,
                paidAmount: totalPaid,
                remaining,
                workOrdersCount: new Set(executor.assignedWorks.map(a => a.workOrderId)).size,
                serviceBreakdown,
                works: executor.assignedWorks.map(a => ({
                    id: a.id,
                    workOrderId: a.workOrderId,
                    workOrderNumber: a.workOrder.orderNumber,
                    carModel: `${a.workOrder.carBrand} ${a.workOrder.carModel}`,
                    customerName: a.workOrder.customerName,
                    workType: a.workType,
                    serviceType: a.serviceType,
                    description: a.description,
                    amount: a.amount,
                    paidAmount: a.paidAmount,
                    isPaid: a.isPaid,
                    createdAt: a.createdAt,
                }))
            };
        });
    }

    async getManagerDashboard(userId: number) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { start: todayStart, end: todayEnd } = this.todayRange();

        // 1. Карточки-счетчики
        const newRequestsToday = await this.prisma.request.count({
            where: { status: RequestStatus.NOVA, createdAt: { gte: todayStart, lte: todayEnd } }
        });
        const dealsToday = await this.prisma.request.count({
            where: { status: RequestStatus.SDELKA, createdAt: { gte: todayStart, lte: todayEnd } }
        });
        const activeWOCount = await this.prisma.workOrder.count({
            where: {
                managerId: userId,
                status: { notIn: [WorkOrderStatus.COMPLETED, WorkOrderStatus.ISSUED, WorkOrderStatus.SENT, WorkOrderStatus.ASSEMBLED] as any }
            }
        });
        const completedWOWeek = await this.prisma.workOrder.count({
            where: {
                managerId: userId,
                status: { in: [WorkOrderStatus.COMPLETED, WorkOrderStatus.ISSUED, WorkOrderStatus.SENT, WorkOrderStatus.ASSEMBLED] as any },
                completedAt: { gte: sevenDaysAgo }
            }
        });

        // 2. Заявки по статусам (7 дней)
        const requestStatuses = [RequestStatus.NOVA, RequestStatus.SDELKA, RequestStatus.OTKLONENO, RequestStatus.ZAVERSHENA];
        const statusStats = await Promise.all(requestStatuses.map(async status => ({
            status,
            count: await this.prisma.request.count({
                where: { status, managerId: userId, createdAt: { gte: sevenDaysAgo } }
            })
        })));

        // 3. Активные заявки
        const myRequests = await this.prisma.request.findMany({
            where: { managerId: userId, status: { in: [RequestStatus.NOVA, RequestStatus.SDELKA] } },
            orderBy: { createdAt: 'desc' },
            take: 20,
            select: { id: true, requestNumber: true, name: true, phone: true, carModel: true, status: true, createdAt: true },
        });

        // 4. Активные заказ-наряды
        const activeWorkOrders = await this.prisma.workOrder.findMany({
            where: {
                managerId: userId,
                status: { notIn: [WorkOrderStatus.COMPLETED, WorkOrderStatus.ISSUED, WorkOrderStatus.SENT, WorkOrderStatus.ASSEMBLED] as any },
            },
            orderBy: { createdAt: 'desc' },
            take: 30,
            select: {
                id: true, orderNumber: true, customerName: true, carBrand: true, carModel: true,
                status: true, master: { select: { name: true } }, createdAt: true,
            },
        });

        return {
            stats: {
                newRequestsToday,
                dealsToday,
                activeWOCount,
                completedWOWeek
            },
            statusStats,
            myRequests,
            activeWorkOrders
        };
    }

    async getMasterDashboard(userId: number) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { start: todayStart } = this.todayRange();

        // Помощник для расчета времени из метаданных
        const calculateTime = (assignments: any[]) => {
            let totalSeconds = 0;
            assignments.forEach(a => {
                const meta = (a.metadata as any) || {};
                if (meta.startedAt) {
                    const start = new Date(meta.startedAt);
                    const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                    totalSeconds += Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
                }
            });
            return totalSeconds;
        };

        const executorStageRaw = await this.prisma.workOrder.findMany({
            where: {
                masterId: userId,
                status: { in: [WorkOrderStatus.ASSIGNED_TO_EXECUTOR, WorkOrderStatus.IN_PROGRESS] as any },
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, orderNumber: true, customerName: true, carBrand: true, carModel: true, status: true, createdAt: true,
                executorAssignments: {
                    select: { id: true, executorId: true, executor: { select: { name: true } }, metadata: true }
                },
            },
        });

        const executorStage = executorStageRaw.map(wo => {
            const totalTasks = wo.executorAssignments.length;
            const doneTasks = wo.executorAssignments.filter(a => (a.metadata as any)?.status === 'DONE').length;
            const timeSeconds = calculateTime(wo.executorAssignments);
            const executors = Array.from(new Set(wo.executorAssignments.map(a => a.executor?.name).filter(Boolean)));

            return {
                ...wo,
                totalTasks,
                doneTasks,
                timeSeconds,
                executors
            };
        });

        const masterStageRaw = await this.prisma.workOrder.findMany({
            where: {
                masterId: userId,
                status: WorkOrderStatus.ASSIGNED_TO_MASTER,
            },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true, orderNumber: true, customerName: true, carBrand: true, carModel: true, status: true, createdAt: true,
                executorAssignments: {
                    select: { id: true, executorId: true, executor: { select: { name: true } }, metadata: true }
                },
            },
        });

        const masterStage = masterStageRaw.map(wo => {
            const timeSeconds = calculateTime(wo.executorAssignments);
            const executorsCount = new Set(wo.executorAssignments.map(a => a.executorId)).size;

            return {
                ...wo,
                timeSeconds,
                executorsCount
            };
        });

        const completedToday = await this.prisma.workOrder.count({
            where: { masterId: userId, completedAt: { gte: todayStart } },
        });
        const completedWeek = await this.prisma.workOrder.count({
            where: { masterId: userId, completedAt: { gte: sevenDaysAgo } },
        });

        return {
            executorStage,
            masterStage,
            stats: {
                executorStage: executorStage.length,
                masterStage: masterStage.length,
                completedToday,
                completedWeek,
            },
        };
    }

    async getExecutorDashboard(userId: number) {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const { start: todayStart, end: todayEnd } = this.todayRange();

        const activeAssignments = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: userId,
                OR: [
                    { metadata: { path: ['status'], not: 'DONE' } as any },
                    { metadata: { path: ['status'], equals: null } as any },
                ],
            },
            include: {
                workOrder: {
                    select: {
                        id: true,
                        orderNumber: true,
                        customerName: true,
                        carBrand: true,
                        carModel: true,
                        status: true,
                    }
                },
            },
        });

        const activeWorkOrdersMap: Record<number, { workOrderId: number; orderNumber: string; customerName: string; car: string; status: string; total: number; done: number; myTimeSeconds: number }> = {};
        
        // Получаем все задачи исполнителя для этих ЗН, чтобы посчитать done/total
        const allMyAssignmentsForActive = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: userId,
                workOrderId: { in: activeAssignments.map(a => a.workOrderId) }
            }
        });

        allMyAssignmentsForActive.forEach(a => {
            const woId = a.workOrderId;
            // Инициализация если еще нет в карте (хотя должна быть из activeAssignments)
            // Но лучше перестраховаться и собрать инфо из workOrder
        });

        // Пересобираем карту правильно
        for (const a of activeAssignments) {
            const wo = a.workOrder;
            if (!wo) continue;
            if (!activeWorkOrdersMap[wo.id]) {
                const myTasks = allMyAssignmentsForActive.filter(task => task.workOrderId === wo.id);
                
                let myTimeSeconds = 0;
                myTasks.forEach(task => {
                    const meta = (task.metadata as any) || {};
                    if (meta.startedAt) {
                        const start = new Date(meta.startedAt);
                        const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                        myTimeSeconds += Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
                    }
                });

                activeWorkOrdersMap[wo.id] = {
                    workOrderId: wo.id,
                    orderNumber: wo.orderNumber,
                    customerName: wo.customerName,
                    car: `${wo.carBrand} ${wo.carModel}`,
                    status: wo.status,
                    total: myTasks.length,
                    done: myTasks.filter(task => (task.metadata as any)?.status === 'DONE').length,
                    myTimeSeconds
                };
            }
        }

        const doneToday = await this.prisma.workOrderExecutor.count({
            where: {
                executorId: userId,
                metadata: { path: ['status'], equals: 'DONE' } as any,
                updatedAt: { gte: todayStart, lte: todayEnd },
            },
        });
        const doneWeek = await this.prisma.workOrderExecutor.count({
            where: {
                executorId: userId,
                metadata: { path: ['status'], equals: 'DONE' } as any,
                updatedAt: { gte: sevenDaysAgo },
            },
        });

        // Время работы сегодня
        const todayTasks = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: userId,
                OR: [
                    { updatedAt: { gte: todayStart, lte: todayEnd } },
                    { metadata: { path: ['startedAt'], gte: todayStart.toISOString() } as any }
                ]
            }
        });

        let timeTodaySeconds = 0;
        todayTasks.forEach(task => {
            const meta = (task.metadata as any) || {};
            if (meta.startedAt) {
                const start = new Date(meta.startedAt);
                // Если задача началась сегодня
                const effectiveStart = start < todayStart ? todayStart : start;
                const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                const effectiveEnd = end > todayEnd ? todayEnd : end;
                
                if (effectiveEnd > effectiveStart) {
                    timeTodaySeconds += Math.max(0, Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / 1000));
                }
            }
        });

        const historyAssignments = await this.prisma.workOrderExecutor.findMany({
            where: {
                executorId: userId,
                metadata: { path: ['status'], equals: 'DONE' } as any,
            },
            orderBy: { updatedAt: 'desc' },
            take: 100,
            include: {
                workOrder: {
                    select: { id: true, orderNumber: true, customerName: true, completedAt: true, carBrand: true, carModel: true },
                },
            },
        });

        const historyMap: Record<number, { orderNumber: string; completedAt?: Date | null; totalAmount: number; timeSeconds: number; car: string }> = {};
        historyAssignments.forEach(a => {
            const woId = a.workOrderId;
            if (!historyMap[woId]) {
                historyMap[woId] = {
                    orderNumber: a.workOrder?.orderNumber || `#${woId}`,
                    completedAt: a.workOrder?.completedAt || a.updatedAt,
                    totalAmount: 0,
                    timeSeconds: 0,
                    car: a.workOrder ? `${a.workOrder.carBrand} ${a.workOrder.carModel}` : ''
                };
            }
            historyMap[woId].totalAmount += a.amount || 0;
            
            const meta = (a.metadata as any) || {};
            if (meta.startedAt) {
                const start = new Date(meta.startedAt);
                const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                historyMap[woId].timeSeconds += Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
            }
        });

        return {
            activeWorkOrders: Object.values(activeWorkOrdersMap),
            tasksDone: { today: doneToday, week: doneWeek },
            timeTodaySeconds,
            history: Object.entries(historyMap).map(([woId, v]) => ({
                workOrderId: Number(woId),
                orderNumber: v.orderNumber,
                completedAt: v.completedAt,
                earned: v.totalAmount,
                timeSeconds: v.timeSeconds,
                car: v.car
            })).sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime()).slice(0, 20),
        };
    }

    async updateExecutorPayment(assignmentId: number, paidAmount: number, isPaid: boolean) {
        // @ts-ignore
        return this.prisma.workOrderExecutor.update({
            where: { id: assignmentId },
            data: {
                paidAmount,
                isPaid,
            }
        });
    }

    async getLoadChart() {
        const statuses = [
            'NEW', 'ASSIGNED_TO_MASTER', 'ASSIGNED_TO_EXECUTOR', 'IN_PROGRESS',
            'PAINTING', 'POLISHING', 'ASSEMBLY_STAGE', 'UNDER_REVIEW', 'READY'
        ];

        const workOrders = await this.prisma.workOrder.findMany({
            where: {
                status: { in: statuses as any }
            },
            include: {
                executor: { select: { name: true } },
                master: { select: { name: true } },
                manager: { select: { name: true } },
            },
            orderBy: { createdAt: 'desc' }
        });

        const stages: Record<string, any[]> = {};
        statuses.forEach(status => {
            stages[status] = workOrders
                .filter(wo => wo.status === status)
                .map(wo => ({
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
                }));
        });

        return { stages };
    }
}
