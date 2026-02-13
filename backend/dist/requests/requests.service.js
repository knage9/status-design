"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
const request_number_service_1 = require("./request-number.service");
const permissions_1 = require("../auth/permissions");
const telegram_service_1 = require("../telegram/telegram.service");
let RequestsService = class RequestsService {
    prisma;
    requestNumberService;
    telegramService;
    constructor(prisma, requestNumberService, telegramService) {
        this.prisma = prisma;
        this.requestNumberService = requestNumberService;
        this.telegramService = telegramService;
    }
    async create(data) {
        const requestNumber = await this.requestNumberService.generateRequestNumber();
        const request = await this.prisma.request.create({
            data: {
                ...data,
                requestNumber,
                arrivalDate: data.arrivalDate,
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
        this.telegramService.sendNewRequestNotification(request).catch(err => {
            console.error('Ошибка при отправке уведомления в Telegram:', err);
        });
        return request;
    }
    async findAll(currentUser, searchQuery, statusFilter, dateFrom, dateTo) {
        const where = {};
        let orderBy = { createdAt: 'desc' };
        if ((0, permissions_1.hasPermission)(currentUser, 'REQUESTS_VIEW_ALL')) {
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
                where.status = statusFilter;
            }
        }
        else if (currentUser.role === 'MASTER') {
            where.status = client_1.RequestStatus.SDELKA;
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
                    { status: client_1.RequestStatus.SDELKA }
                ];
            }
            orderBy = { arrivalDate: 'asc' };
        }
        else {
            throw new common_1.ForbiddenException('Недостаточно прав для просмотра заявок');
        }
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
    async findOne(id, currentUser) {
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
            throw new common_1.NotFoundException('Заявка не найдена');
        }
        if ((0, permissions_1.hasPermission)(currentUser, 'REQUESTS_VIEW_ALL')) {
            return request;
        }
        if (currentUser.role === 'MASTER' && request.status === client_1.RequestStatus.SDELKA) {
            return request;
        }
        throw new common_1.NotFoundException('Заявка не найдена или доступ запрещен');
    }
    async update(id, data) {
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
    async remove(id) {
        return this.prisma.request.delete({ where: { id } });
    }
    async changeStatus(requestId, currentUser, status, data) {
        if (!(0, permissions_1.hasPermission)(currentUser, 'REQUESTS_PROCESS')) {
            throw new common_1.ForbiddenException('Недостаточно прав для обработки заявки');
        }
        const statusEnum = status === 'SDELKA' ? client_1.RequestStatus.SDELKA : client_1.RequestStatus.OTKLONENO;
        if (status === 'SDELKA') {
            if (!data.managerComment || data.managerComment.trim() === '') {
                throw new common_1.BadRequestException('Комментарий менеджера обязателен при переводе в статус "Сделка"');
            }
            if (!data.arrivalDate) {
                throw new common_1.BadRequestException('Дата и время приезда обязательны при переводе в статус "Сделка"');
            }
        }
        if (status === 'OTKLONENO') {
            if (!data.managerComment || data.managerComment.trim() === '') {
                throw new common_1.BadRequestException('Комментарий менеджера обязателен при отклонении заявки');
            }
        }
        const updateData = {
            status: statusEnum,
            managerId: currentUser.id,
            managerComment: data.managerComment,
            startedAt: new Date(),
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
    async takeToWork(requestId, currentUser) {
        if (!(0, permissions_1.hasPermission)(currentUser, 'REQUESTS_PROCESS')) {
            throw new common_1.ForbiddenException('Недостаточно прав для обработки заявки');
        }
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                managerId: currentUser.id,
                status: client_1.RequestStatus.NOVA,
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
    async complete(requestId) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.ZAVERSHENA,
                completedAt: new Date(),
            },
        });
    }
    async close(requestId) {
        return this.prisma.request.update({
            where: { id: requestId },
            data: {
                status: client_1.RequestStatus.OTKLONENO,
                completedAt: new Date(),
            },
        });
    }
    async getStats() {
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const total = await this.prisma.request.count();
        const newRequests = await this.prisma.request.count({
            where: { status: client_1.RequestStatus.NOVA },
        });
        const thisWeek = await this.prisma.request.count({
            where: { createdAt: { gte: sevenDaysAgo } },
        });
        return { total, new: newRequests, thisWeek };
    }
};
exports.RequestsService = RequestsService;
exports.RequestsService = RequestsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        request_number_service_1.RequestNumberService,
        telegram_service_1.TelegramService])
], RequestsService);
//# sourceMappingURL=requests.service.js.map