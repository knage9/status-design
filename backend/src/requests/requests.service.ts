import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, RequestStatus } from '@prisma/client';
import { RequestNumberService } from './request-number.service';
import { CurrentUser, hasPermission } from '../auth/permissions';
import { TelegramService } from '../telegram/telegram.service';

@Injectable()
export class RequestsService {
    constructor(
        private prisma: PrismaService,
        private requestNumberService: RequestNumberService,
        private telegramService: TelegramService,
    ) { }

    async create(data: Prisma.RequestCreateInput) {
        const requestNumber = await this.requestNumberService.generateRequestNumber();

        const request = await this.prisma.request.create({
            data: {
                ...data,
                requestNumber,
                // @ts-ignore
                arrivalDate: (data as any).arrivalDate,
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });

        // Отправка уведомления в Telegram (не дожидаемся завершения, чтобы не тормозить ответ)
        this.telegramService.sendNewRequestNotification(request).catch(err => {
            console.error('Ошибка при отправке уведомления в Telegram:', err);
        });

        return request;
    }

    async findAll(
        currentUser: CurrentUser,
        searchQuery?: string,
        statusFilter?: string,
        dateFrom?: string,
        dateTo?: string
    ) {
        const where: any = {};

        // ADMIN/MANAGER: полное право просмотра
        let orderBy: any = { createdAt: 'desc' };
        if (hasPermission(currentUser, 'REQUESTS_VIEW_ALL')) {
            if (searchQuery) {
                const numeric = Number(searchQuery);
                where.OR = [
                    { name: { contains: searchQuery, mode: 'insensitive' } },
                    { phone: { contains: searchQuery } },
                    { requestNumber: { contains: searchQuery, mode: 'insensitive' } },
                    { carModel: { contains: searchQuery, mode: 'insensitive' } },
                    ...(Number.isFinite(numeric) ? [{ id: numeric }] : []),
                ];
            }
            if (statusFilter) {
                where.status = statusFilter as RequestStatus;
            }
        } else if (currentUser.role === 'MASTER') {
            // MASTER: только заявки в статусе СДЕЛКА
            where.status = RequestStatus.SDELKA;
            if (searchQuery) {
                const numeric = Number(searchQuery);
                where.AND = [
                    {
                        OR: [
                            { name: { contains: searchQuery, mode: 'insensitive' } },
                            { phone: { contains: searchQuery } },
                            { requestNumber: { contains: searchQuery, mode: 'insensitive' } },
                            { carModel: { contains: searchQuery, mode: 'insensitive' } },
                            ...(Number.isFinite(numeric) ? [{ id: numeric }] : []),
                        ]
                    },
                    { status: RequestStatus.SDELKA }
                ];
            }
            orderBy = { arrivalDate: 'asc' };
        } else {
            throw new ForbiddenException('Недостаточно прав для просмотра заявок');
        }

        // Фильтр по дате создания (если нужно)
        if (dateFrom || dateTo) {
            where.createdAt = {};
            if (dateFrom) {
                where.createdAt.gte = new Date(dateFrom);
            }
            if (dateTo) {
                const endDate = new Date(dateTo);
                endDate.setHours(23, 59, 59, 999);
                where.createdAt.lte = endDate;
            }
        }

        return this.prisma.request.findMany({
            where,
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy,
        });
    }

    async findOne(id: number, currentUser: CurrentUser) {
        const request = await this.prisma.request.findUnique({
            where: { id },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        phone: true,
                    },
                },
                workOrders: {
                    include: {
                        manager: { select: { name: true } },
                        master: { select: { name: true } },
                        executor: { select: { name: true } },
                        executorAssignments: {
                            include: {
                                executor: {
                                    select: {
                                        id: true,
                                        name: true,
                                        email: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!request) {
            throw new NotFoundException('Заявка не найдена');
        }

        if (hasPermission(currentUser, 'REQUESTS_VIEW_ALL')) {
            return request;
        }

        if (currentUser.role === 'MASTER' && request.status === RequestStatus.SDELKA) {
            return request;
        }

        throw new NotFoundException('Заявка не найдена или доступ запрещен');
    }

    async update(id: number, data: Prisma.RequestUpdateInput) {
        return this.prisma.request.update({
            where: { id },
            data,
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async remove(id: number) {
        return this.prisma.request.delete({ where: { id } });
    }

    // Изменение статуса заявки (только для MANAGER)
    async changeStatus(
        requestId: number,
        currentUser: CurrentUser,
        status: 'SDELKA' | 'OTKLONENO',
        data: { managerComment: string; arrivalDate?: Date }
    ) {
        if (!hasPermission(currentUser, 'REQUESTS_PROCESS')) {
            throw new ForbiddenException('Недостаточно прав для обработки заявки');
        }

        // Проверка валидации
        const statusEnum = status === 'SDELKA' ? RequestStatus.SDELKA : RequestStatus.OTKLONENO;

        if (status === 'SDELKA') {
            if (!data.managerComment || data.managerComment.trim() === '') {
                throw new BadRequestException('Комментарий менеджера обязателен при переводе в статус "Сделка"');
            }
            if (!data.arrivalDate) {
                throw new BadRequestException('Дата и время приезда обязательны при переводе в статус "Сделка"');
            }
        }

        if (status === 'OTKLONENO') {
            if (!data.managerComment || data.managerComment.trim() === '') {
                throw new BadRequestException('Комментарий менеджера обязателен при отклонении заявки');
            }
        }

        const updateData: any = {
            status: statusEnum,
            managerId: currentUser.id,
            managerComment: data.managerComment,
            startedAt: new Date(), // Время отработки заявки
        };

        if (status === 'SDELKA' && data.arrivalDate) {
            updateData.arrivalDate = data.arrivalDate;
        }

        return this.prisma.request.update({
            where: { id: requestId },
            data: updateData,
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    // Workflow methods (старые методы для обратной совместимости)
    async takeToWork(requestId: number, currentUser: CurrentUser) {
        if (!hasPermission(currentUser, 'REQUESTS_PROCESS')) {
            throw new ForbiddenException('Недостаточно прав для обработки заявки');
        }

        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                managerId: currentUser.id,
                status: RequestStatus.NOVA,
                startedAt: new Date(),
            },
            include: {
                manager: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    async complete(requestId: number) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                status: RequestStatus.ZAVERSHENA,
                completedAt: new Date(),
            },
        });
    }

    async close(requestId: number) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                status: RequestStatus.OTKLONENO,
                completedAt: new Date(),
            },
        });
    }

    // For dashboard stats
    async getStats() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const total = await this.prisma.request.count();
        const newRequests = await this.prisma.request.count({
            where: { status: RequestStatus.NOVA },
        });
        const thisWeek = await this.prisma.request.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        return { total, new: newRequests, thisWeek };
    }
}
