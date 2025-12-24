import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { RequestNumberService } from './request-number.service';

@Injectable()
export class RequestsService {
    constructor(
        private prisma: PrismaService,
        private requestNumberService: RequestNumberService,
    ) { }

    async create(data: Prisma.RequestCreateInput) {
        const requestNumber = await this.requestNumberService.generateRequestNumber();

        return this.prisma.request.create({
            data: {
                ...data,
                requestNumber,
                // @ts-ignore
                arrivalAt: (data as any).arrivalAt,
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
    }

    async findAllAdmin(userId?: number, role?: string, searchQuery?: string) {
        const where: any = {};

        // Поиск по имени или телефону клиента
        if (searchQuery) {
            where.OR = [
                { name: { contains: searchQuery, mode: 'insensitive' } },
                { phone: { contains: searchQuery } }
            ];
        }

        // Role-based filtering
        if (role === 'MANAGER' && userId) {
            const roleFilter = {
                OR: [
                    { managerId: userId },
                    { managerId: null }, // New requests without manager
                ]
            };

            // Если есть и поиск, и фильтр по роли, объединяем через AND
            if (searchQuery) {
                where.AND = [
                    { OR: where.OR }, // Поиск
                    roleFilter,        // Фильтр по роли
                ];
                delete where.OR;
            } else {
                where.OR = roleFilter.OR;
            }
        }

        // Role-based filtering for MASTER (only SDELKA)
        if (role === 'MASTER') {
            where.status = 'SDELKA';
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
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.request.findUnique({
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
                    },
                },
            },
        });
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

    // Workflow methods
    async takeToWork(requestId: number, userId: number) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                managerId: userId,
                status: 'IN_PROGRESS',
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
                status: 'COMPLETED',
                completedAt: new Date(),
            },
        });
    }

    async close(requestId: number) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                status: 'CLOSED',
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
            where: { status: 'NEW' },
        });
        const thisWeek = await this.prisma.request.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });

        return { total, new: newRequests, thisWeek };
    }
}
