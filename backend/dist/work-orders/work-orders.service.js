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
exports.WorkOrdersService = void 0;
const common_1 = require("@nestjs/common");
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../prisma/prisma.service");
const work_order_number_service_1 = require("./work-order-number.service");
const client_2 = require("@prisma/client");
const permissions_1 = require("../auth/permissions");
let WorkOrdersService = class WorkOrdersService {
    prisma;
    numberService;
    constructor(prisma, numberService) {
        this.prisma = prisma;
        this.numberService = numberService;
    }
    hasExecutorTaskInJson(order, executorId) {
        const services = order.servicesData || {};
        const serviceHasExecutor = Object.values(services).some((entry) => {
            if (!entry)
                return false;
            if (typeof entry === 'object' && entry.executorId) {
                return entry.executorId === executorId;
            }
            if (entry.dismounting?.executorId === executorId)
                return true;
            if (entry.mounting?.executorId === executorId)
                return true;
            return false;
        });
        if (serviceHasExecutor)
            return true;
        const bodyParts = order.bodyPartsData || {};
        return Object.values(bodyParts).some((entry) => entry?.executorId === executorId);
    }
    hasExecutorTasksInPayload(data) {
        if (data.armaturaExecutors) {
            const { dismantling, disassembly, assembly, mounting } = data.armaturaExecutors;
            if (dismantling || disassembly || assembly || mounting)
                return true;
        }
        if (data.fixedServices) {
            const { brakeCalipers, wheels } = data.fixedServices;
            if (brakeCalipers?.removedBy || brakeCalipers?.installedBy || wheels?.removedBy || wheels?.installedBy)
                return true;
        }
        if (data.additionalServices?.length)
            return true;
        if (data.bodyPartsData) {
            const hasBodyExec = Object.values(data.bodyPartsData).some((entry) => entry?.executorId);
            if (hasBodyExec)
                return true;
        }
        if (data.servicesData) {
            const s = data.servicesData;
            if (s.film?.executorId)
                return true;
            if (s.dryCleaning?.executorId)
                return true;
            if (s.polishing?.executorId)
                return true;
            if (s.wheelPainting?.dismounting?.executorId || s.wheelPainting?.mounting?.executorId)
                return true;
            if (s.carbon?.executorId)
                return true;
            if (s.soundproofing?.executorId)
                return true;
            if (s.bonus?.executorId)
                return true;
        }
        return false;
    }
    stripFinanceIfNeeded(orders, currentUser) {
        if ((0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_FINANCE')) {
            return orders;
        }
        return orders.map(order => {
            const clone = { ...order };
            delete clone.totalAmount;
            delete clone.paymentMethod;
            if (clone.executorAssignments) {
                clone.executorAssignments = clone.executorAssignments.map((a) => {
                    const { amount, isPaid, paidAmount, ...rest } = a;
                    return rest;
                });
            }
            return clone;
        });
    }
    async create(data, currentUser) {
        try {
            console.log('Creating work order with data:', data);
            let finalManagerId = data.managerId;
            if (data.requestId && !finalManagerId) {
                const request = await this.prisma.request.findUnique({
                    where: { id: data.requestId },
                    select: { managerId: true }
                });
                if (request?.managerId) {
                    finalManagerId = request.managerId;
                }
                else {
                    throw new common_1.NotFoundException('У заявки не указан менеджер. Невозможно создать заказ-наряд.');
                }
            }
            if (!finalManagerId) {
                throw new common_1.BadRequestException('Необходимо указать менеджера (managerId)');
            }
            const orderNumber = await this.numberService.generateNumber();
            console.log('Generated order number:', orderNumber);
            const totalAmount = data.totalAmount;
            const { armaturaExecutors, fixedServices, additionalServices, masterId, ...workOrderData } = data;
            const finalMasterId = masterId || data.masterId;
            const hasExecutorTasks = this.hasExecutorTasksInPayload(data);
            const initialStatus = hasExecutorTasks
                ? client_2.WorkOrderStatus.ASSIGNED_TO_EXECUTOR
                : (finalMasterId ? client_2.WorkOrderStatus.ASSIGNED_TO_MASTER : client_2.WorkOrderStatus.NEW);
            const result = await this.prisma.workOrder.create({
                data: {
                    ...workOrderData,
                    managerId: finalManagerId,
                    masterId: finalMasterId,
                    orderNumber,
                    status: initialStatus,
                    photosBeforeWork: [],
                    photosAfterWork: [],
                    servicesData: data.servicesData || {},
                    bodyPartsData: data.bodyPartsData || {},
                },
                include: {
                    request: true,
                    manager: { select: { id: true, name: true, email: true } },
                    master: { select: { id: true, name: true, email: true } },
                    executor: { select: { id: true, name: true, email: true } },
                },
            });
            const assignments = [];
            if (armaturaExecutors) {
                if (armaturaExecutors.dismantling) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.dismantling,
                        workType: client_2.WorkType.ARMATURA_DISMANTLING,
                        amount: totalAmount * 0.07,
                        description: 'Демонтаж',
                    });
                }
                if (armaturaExecutors.disassembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.disassembly,
                        workType: client_2.WorkType.ARMATURA_DISASSEMBLY,
                        amount: totalAmount * 0.03,
                        description: 'Разборка',
                    });
                }
                if (armaturaExecutors.assembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.assembly,
                        workType: client_2.WorkType.ARMATURA_ASSEMBLY,
                        amount: totalAmount * 0.03,
                        description: 'Сборка',
                    });
                }
                if (armaturaExecutors.mounting) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.mounting,
                        workType: client_2.WorkType.ARMATURA_MOUNTING,
                        amount: totalAmount * 0.07,
                        description: 'Монтаж',
                    });
                }
            }
            if (fixedServices) {
                if (fixedServices.brakeCalipers) {
                    if (fixedServices.brakeCalipers.removedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.brakeCalipers.removedBy,
                            workType: client_2.WorkType.FIXED_BRAKE_CALIPERS_REMOVE,
                            amount: 2500,
                            description: 'Арматура суппортов - снял',
                        });
                    }
                    if (fixedServices.brakeCalipers.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.brakeCalipers.installedBy,
                            workType: client_2.WorkType.FIXED_BRAKE_CALIPERS_INSTALL,
                            amount: 2500,
                            description: 'Арматура суппортов - поставил',
                        });
                    }
                }
                if (fixedServices.wheels) {
                    if (fixedServices.wheels.removedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.wheels.removedBy,
                            workType: client_2.WorkType.FIXED_WHEELS_REMOVE,
                            amount: 500,
                            description: 'Колёса - снял',
                        });
                    }
                    if (fixedServices.wheels.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.wheels.installedBy,
                            workType: client_2.WorkType.FIXED_WHEELS_INSTALL,
                            amount: 500,
                            description: 'Колёса - поставил',
                        });
                    }
                }
            }
            if (data.bodyPartsData) {
                for (const [partType, partData] of Object.entries(data.bodyPartsData)) {
                    if (partData.executorId && partData.quantity > 0) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: partData.executorId,
                            workType: client_2.WorkType.BODY_PART,
                            amount: partData.quantity * 400,
                            description: partType,
                            metadata: partData,
                        });
                    }
                }
            }
            if (data.servicesData) {
                if (data.servicesData.film?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.film.executorId,
                        workType: client_2.WorkType.SERVICE_FILM,
                        serviceType: client_2.ServiceType.FILM,
                        amount: data.servicesData.film.amount,
                        description: 'Плёнка',
                    });
                }
                if (data.servicesData.dryCleaning?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.dryCleaning.executorId,
                        workType: client_2.WorkType.SERVICE_DRY_CLEANING,
                        serviceType: client_2.ServiceType.DRY_CLEANING,
                        amount: data.servicesData.dryCleaning.executorAmount,
                        description: 'Химчистка',
                    });
                }
                if (data.servicesData.polishing?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.polishing.executorId,
                        workType: client_2.WorkType.SERVICE_POLISHING,
                        serviceType: client_2.ServiceType.POLISHING,
                        amount: data.servicesData.polishing.executorAmount,
                        description: 'Полировка/Керамика',
                    });
                }
                if (data.servicesData.wheelPainting) {
                    const wp = data.servicesData.wheelPainting;
                    if (wp.dismounting?.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.dismounting.executorId,
                            workType: client_2.WorkType.SERVICE_WHEEL_PAINTING,
                            serviceType: client_2.ServiceType.WHEEL_PAINTING,
                            amount: wp.dismounting.amount || 0,
                            description: 'Покраска дисков - Демонтаж',
                        });
                    }
                    if (wp.mounting?.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.mounting.executorId,
                            workType: client_2.WorkType.SERVICE_WHEEL_PAINTING_MOUNTING,
                            serviceType: client_2.ServiceType.WHEEL_PAINTING,
                            amount: wp.mounting.amount || 0,
                            description: 'Покраска дисков - Монтаж',
                        });
                    }
                }
                if (data.servicesData.carbon) {
                    const carbon = data.servicesData.carbon;
                    if (carbon.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: carbon.executorId,
                            workType: client_2.WorkType.SERVICE_CARBON,
                            serviceType: client_2.ServiceType.CARBON,
                            amount: carbon.price || 0,
                            description: `Карбон - ${carbon.stage || ''} (${carbon.type || ''})`,
                            metadata: carbon,
                        });
                    }
                }
                if (data.servicesData.soundproofing?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.soundproofing.executorId,
                        workType: client_2.WorkType.SERVICE_SOUNDPROOFING,
                        serviceType: client_2.ServiceType.SOUNDPROOFING,
                        amount: data.servicesData.soundproofing.amount || 0,
                        description: 'Шумоизоляция',
                    });
                }
                if (data.servicesData.bonus?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.bonus.executorId,
                        workType: client_2.WorkType.SERVICE_BONUS,
                        amount: data.servicesData.bonus.amount || 0,
                        description: data.servicesData.bonus.comment || 'Дополнительная выплата / бонус',
                    });
                }
            }
            if (additionalServices?.length) {
                for (const service of additionalServices) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: service.executorId,
                        workType: client_2.WorkType.ARMATURA_ADDITIONAL,
                        amount: service.amount,
                        description: service.name,
                    });
                }
            }
            if (assignments.length > 0) {
                const prepared = assignments.map(a => ({
                    ...a,
                    metadata: { ...(a.metadata || {}), status: a.metadata?.status || 'PENDING' },
                }));
                await this.prisma.workOrderExecutor.createMany({
                    data: prepared,
                });
                console.log(`Created ${assignments.length} executor assignments`);
            }
            console.log('Work order created successfully:', result.id);
            return result;
        }
        catch (error) {
            console.error('Error creating work order:', error);
            if (error instanceof client_1.Prisma.PrismaClientKnownRequestError) {
                console.log('Prisma error code:', error.code);
                if (error.code === 'P2003') {
                    throw new common_1.NotFoundException(`Request or Manager not found. Details: ${error.meta?.field_name}`);
                }
                if (error.code === 'P2002') {
                    throw new common_1.ConflictException('Work order number already exists');
                }
            }
            throw new common_1.InternalServerErrorException(`Failed to create work order: ${error.message}`);
        }
    }
    async findAll(currentUser, view, search) {
        const searchTerm = search?.trim();
        const searchNumber = searchTerm ? Number(searchTerm) : null;
        const buildSearchWhere = () => {
            if (!searchTerm)
                return undefined;
            const or = [
                { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
                { carBrand: { contains: searchTerm, mode: 'insensitive' } },
                { carModel: { contains: searchTerm, mode: 'insensitive' } },
                { customerName: { contains: searchTerm, mode: 'insensitive' } },
                { customerPhone: { contains: searchTerm, mode: 'insensitive' } },
            ];
            if (Number.isFinite(searchNumber)) {
                or.push({ id: searchNumber });
            }
            return { OR: or };
        };
        const filterBySearch = (orders) => {
            if (!searchTerm)
                return orders;
            const term = searchTerm.toLowerCase();
            return orders.filter(o => o.orderNumber?.toLowerCase().includes(term) ||
                o.carBrand?.toLowerCase().includes(term) ||
                o.carModel?.toLowerCase().includes(term) ||
                o.customerName?.toLowerCase().includes(term) ||
                o.customerPhone?.toLowerCase().includes(term) ||
                (Number.isFinite(searchNumber) && o.id === searchNumber));
        };
        const baseInclude = {
            request: true,
            manager: { select: { id: true, name: true, email: true } },
            master: { select: { id: true, name: true, email: true } },
            executor: { select: { id: true, name: true, email: true } },
        };
        if ((0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_ALL')) {
            const where = buildSearchWhere() || {};
            if (view === 'my') {
                where.managerId = currentUser.id;
            }
            const orders = await this.prisma.workOrder.findMany({
                where,
                include: baseInclude,
                orderBy: { createdAt: 'desc' },
            });
            return orders;
        }
        if (!(0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            throw new common_1.ForbiddenException('Недостаточно прав для просмотра заказ-нарядов');
        }
        if (currentUser.role === 'MASTER') {
            const where = { masterId: currentUser.id, ...(buildSearchWhere() || {}) };
            const orders = await this.prisma.workOrder.findMany({
                where,
                include: baseInclude,
                orderBy: { createdAt: 'desc' },
            });
            return this.stripFinanceIfNeeded(orders, currentUser);
        }
        if (currentUser.role === 'EXECUTOR') {
            const candidateOrders = await this.prisma.workOrder.findMany({
                include: {
                    ...baseInclude,
                    executorAssignments: true,
                },
                orderBy: { createdAt: 'desc' },
            });
            const filtered = candidateOrders.filter(order => {
                const hasAssignment = order.executorAssignments?.some(a => a.executorId === currentUser.id);
                return hasAssignment || this.hasExecutorTaskInJson(order, currentUser.id);
            });
            return this.stripFinanceIfNeeded(filterBySearch(filtered), currentUser);
        }
        const where = { managerId: currentUser.id, ...(buildSearchWhere() || {}) };
        const managerOrders = await this.prisma.workOrder.findMany({
            where,
            include: baseInclude,
            orderBy: { createdAt: 'desc' },
        });
        return this.stripFinanceIfNeeded(managerOrders, currentUser);
    }
    async findOne(id, currentUser) {
        const order = await this.prisma.workOrder.findUnique({
            where: { id },
            include: {
                request: true,
                manager: { select: { id: true, name: true, email: true, phone: true } },
                master: { select: { id: true, name: true, email: true, phone: true } },
                executor: { select: { id: true, name: true, email: true, phone: true } },
                executorAssignments: {
                    include: {
                        executor: { select: { id: true, name: true, email: true } }
                    }
                }
            },
        });
        if (!order)
            return null;
        const canViewAll = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_ALL');
        let canViewOwn = false;
        if ((0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            if (currentUser.role === 'MASTER' && order.masterId === currentUser.id) {
                canViewOwn = true;
            }
            else if (currentUser.role === 'EXECUTOR') {
                const hasAssignment = order.executorAssignments?.some(a => a.executorId === currentUser.id) || false;
                const hasJsonTask = this.hasExecutorTaskInJson(order, currentUser.id);
                canViewOwn = hasAssignment || hasJsonTask;
                if (order.executorAssignments) {
                    order.executorAssignments = order.executorAssignments.filter(a => a.executorId === currentUser.id);
                }
            }
            else if (order.managerId === currentUser.id) {
                canViewOwn = true;
            }
        }
        if (!canViewAll && !canViewOwn) {
            throw new common_1.NotFoundException('Work order not found or access denied');
        }
        const armaturaExecutors = {};
        const fixedServices = {};
        const additionalServices = [];
        const findAssignment = (type) => order.executorAssignments?.find(a => a.workType === type);
        const dismantlingAss = findAssignment('ARMATURA_DISMANTLING');
        if (order.dismantling || dismantlingAss) {
            armaturaExecutors.dismantling = {
                enabled: order.dismantling || !!dismantlingAss,
                executorId: dismantlingAss?.executorId || order.dismantlingExecutorId,
                price: dismantlingAss?.amount || order.dismantlingPrice
            };
        }
        const disassemblyAss = findAssignment('ARMATURA_DISASSEMBLY');
        if (order.disassembly || disassemblyAss) {
            armaturaExecutors.disassembly = {
                enabled: order.disassembly || !!disassemblyAss,
                executorId: disassemblyAss?.executorId || order.disassemblyExecutorId,
                price: disassemblyAss?.amount || order.disassemblyPrice
            };
        }
        const assemblyAss = findAssignment('ARMATURA_ASSEMBLY');
        if (order.assembly || assemblyAss) {
            armaturaExecutors.assembly = {
                enabled: order.assembly || !!assemblyAss,
                executorId: assemblyAss?.executorId || order.assemblyExecutorId,
                price: assemblyAss?.amount || order.assemblyPrice
            };
        }
        const mountingAss = findAssignment('ARMATURA_MOUNTING');
        if (order.mounting || mountingAss) {
            armaturaExecutors.mounting = {
                enabled: order.mounting || !!mountingAss,
                executorId: mountingAss?.executorId || order.mountingExecutorId,
                price: mountingAss?.amount || order.mountingPrice
            };
        }
        const brakeRem = findAssignment('FIXED_BRAKE_CALIPERS_REMOVE');
        const brakeInst = findAssignment('FIXED_BRAKE_CALIPERS_INSTALL');
        if (brakeRem || brakeInst) {
            fixedServices.brakeCalipers = {
                removedBy: brakeRem?.executorId,
                installedBy: brakeInst?.executorId,
            };
        }
        const wheelRem = findAssignment('FIXED_WHEELS_REMOVE');
        const wheelInst = findAssignment('FIXED_WHEELS_INSTALL');
        if (wheelRem || wheelInst) {
            fixedServices.wheels = {
                removedBy: wheelRem?.executorId,
                installedBy: wheelInst?.executorId,
            };
        }
        if (order.executorAssignments) {
            order.executorAssignments.forEach(assignment => {
                if (assignment.workType === 'ARMATURA_ADDITIONAL') {
                    additionalServices.push({
                        name: assignment.description,
                        executorId: assignment.executorId,
                        amount: assignment.amount,
                    });
                }
            });
        }
        const executorTotals = {};
        if (order.executorAssignments) {
            order.executorAssignments = order.executorAssignments.map(a => {
                const meta = a.metadata || {};
                let seconds = 0;
                if (meta.startedAt) {
                    const start = new Date(meta.startedAt);
                    const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                    seconds = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
                }
                if (a.executorId) {
                    if (!executorTotals[a.executorId])
                        executorTotals[a.executorId] = { seconds: 0 };
                    executorTotals[a.executorId].seconds += seconds;
                }
                a.durationSeconds = seconds;
                return a;
            });
        }
        const result = {
            ...order,
            armaturaExecutors: Object.keys(armaturaExecutors).length > 0 ? armaturaExecutors : undefined,
            fixedServices: Object.keys(fixedServices).length > 0 ? fixedServices : undefined,
            additionalServices: additionalServices.length > 0 ? additionalServices : undefined,
            executorTimers: executorTotals,
        };
        const canViewFinance = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_FINANCE');
        if (!canViewFinance) {
            delete result.totalAmount;
            delete result.paymentMethod;
            if (result.armaturaExecutors) {
                Object.keys(result.armaturaExecutors).forEach(key => {
                    if (result.armaturaExecutors[key]) {
                        delete result.armaturaExecutors[key].price;
                    }
                });
            }
            if (result.additionalServices) {
                result.additionalServices = result.additionalServices.map((s) => {
                    const { amount, ...rest } = s;
                    return rest;
                });
            }
            if (result.executorAssignments) {
                if (currentUser.role === 'MASTER') {
                    result.executorAssignments = result.executorAssignments.map((a) => {
                        const { amount, isPaid, paidAmount, ...rest } = a;
                        return rest;
                    });
                }
                else if (currentUser.role === 'EXECUTOR') {
                    result.executorAssignments = result.executorAssignments
                        .filter((a) => a.executorId === currentUser.id)
                        .map((a) => {
                        const { isPaid, paidAmount, ...rest } = a;
                        return rest;
                    });
                }
            }
        }
        else {
        }
        return result;
    }
    async update(id, data, currentUser) {
        const canEditAll = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_EDIT_ALL');
        const canEditAssigned = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_EDIT_ASSIGNED');
        if (!canEditAll && !canEditAssigned) {
            throw new common_1.ForbiddenException('Недостаточно прав для редактирования заказ-наряда');
        }
        if (!canEditAll && canEditAssigned) {
            const workOrder = await this.prisma.workOrder.findUnique({
                where: { id },
                select: { masterId: true },
            });
            if (!workOrder || workOrder.masterId !== currentUser.id) {
                throw new common_1.ForbiddenException('Можно редактировать только назначенные вам заказ-наряды');
            }
            const { totalAmount, paymentMethod, ...rest } = data;
            data = rest;
            if (data.armaturaExecutors) {
                Object.keys(data.armaturaExecutors).forEach(key => {
                    if (data.armaturaExecutors?.[key]) {
                        delete data.armaturaExecutors[key].price;
                    }
                });
            }
        }
        const canViewFinance = (0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_VIEW_FINANCE');
        if (!canViewFinance) {
            const { totalAmount, paymentMethod, ...rest } = data;
            data = rest;
        }
        if (data.totalAmount) {
            await this.recalculateArmaturaPayments(id, data.totalAmount);
        }
        const { armaturaExecutors, fixedServices, additionalServices, ...workOrderData } = data;
        if (data.servicesData || data.bodyPartsData || armaturaExecutors || fixedServices || additionalServices) {
            const result = await this.prisma.workOrder.findUnique({ where: { id } });
            if (result) {
                const assignments = [];
                const totalAmount = data.totalAmount || result.totalAmount;
                const typesToClean = [];
                if (armaturaExecutors) {
                    typesToClean.push(client_2.WorkType.ARMATURA_DISMANTLING, client_2.WorkType.ARMATURA_DISASSEMBLY, client_2.WorkType.ARMATURA_ASSEMBLY, client_2.WorkType.ARMATURA_MOUNTING);
                    if (armaturaExecutors.dismantling)
                        assignments.push({ workOrderId: id, executorId: armaturaExecutors.dismantling, workType: client_2.WorkType.ARMATURA_DISMANTLING, amount: totalAmount * 0.07, description: 'Демонтаж' });
                    if (armaturaExecutors.disassembly)
                        assignments.push({ workOrderId: id, executorId: armaturaExecutors.disassembly, workType: client_2.WorkType.ARMATURA_DISASSEMBLY, amount: totalAmount * 0.03, description: 'Разборка' });
                    if (armaturaExecutors.assembly)
                        assignments.push({ workOrderId: id, executorId: armaturaExecutors.assembly, workType: client_2.WorkType.ARMATURA_ASSEMBLY, amount: totalAmount * 0.03, description: 'Сборка' });
                    if (armaturaExecutors.mounting)
                        assignments.push({ workOrderId: id, executorId: armaturaExecutors.mounting, workType: client_2.WorkType.ARMATURA_MOUNTING, amount: totalAmount * 0.07, description: 'Монтаж' });
                }
                if (fixedServices) {
                    typesToClean.push(client_2.WorkType.FIXED_BRAKE_CALIPERS_REMOVE, client_2.WorkType.FIXED_BRAKE_CALIPERS_INSTALL, client_2.WorkType.FIXED_WHEELS_REMOVE, client_2.WorkType.FIXED_WHEELS_INSTALL);
                    if (fixedServices.brakeCalipers?.removedBy)
                        assignments.push({ workOrderId: id, executorId: fixedServices.brakeCalipers.removedBy, workType: client_2.WorkType.FIXED_BRAKE_CALIPERS_REMOVE, amount: 2500, description: 'Арматура суппортов - снял' });
                    if (fixedServices.brakeCalipers?.installedBy)
                        assignments.push({ workOrderId: id, executorId: fixedServices.brakeCalipers.installedBy, workType: client_2.WorkType.FIXED_BRAKE_CALIPERS_INSTALL, amount: 2500, description: 'Арматура суппортов - поставил' });
                    if (fixedServices.wheels?.removedBy)
                        assignments.push({ workOrderId: id, executorId: fixedServices.wheels.removedBy, workType: client_2.WorkType.FIXED_WHEELS_REMOVE, amount: 500, description: 'Колёса - снял' });
                    if (fixedServices.wheels?.installedBy)
                        assignments.push({ workOrderId: id, executorId: fixedServices.wheels.installedBy, workType: client_2.WorkType.FIXED_WHEELS_INSTALL, amount: 500, description: 'Колёса - поставил' });
                }
                if (data.bodyPartsData) {
                    typesToClean.push(client_2.WorkType.BODY_PART);
                    for (const [partType, partData] of Object.entries(data.bodyPartsData)) {
                        if (partData.executorId && partData.quantity > 0) {
                            assignments.push({ workOrderId: id, executorId: partData.executorId, workType: client_2.WorkType.BODY_PART, amount: partData.quantity * 400, description: partType, metadata: partData });
                        }
                    }
                }
                if (data.servicesData) {
                    typesToClean.push(client_2.WorkType.SERVICE_FILM, client_2.WorkType.SERVICE_DRY_CLEANING, client_2.WorkType.SERVICE_POLISHING, client_2.WorkType.SERVICE_WHEEL_PAINTING, client_2.WorkType.SERVICE_WHEEL_PAINTING_MOUNTING, client_2.WorkType.SERVICE_WHEEL_PAINTING_CAPS, client_2.WorkType.SERVICE_CARBON, client_2.WorkType.SERVICE_SOUNDPROOFING, client_2.WorkType.SERVICE_BONUS);
                    if (data.servicesData.film?.executorId)
                        assignments.push({ workOrderId: id, executorId: data.servicesData.film.executorId, workType: client_2.WorkType.SERVICE_FILM, serviceType: client_2.ServiceType.FILM, amount: data.servicesData.film.amount, description: 'Плёнка' });
                    if (data.servicesData.dryCleaning?.executorId)
                        assignments.push({ workOrderId: id, executorId: data.servicesData.dryCleaning.executorId, workType: client_2.WorkType.SERVICE_DRY_CLEANING, serviceType: client_2.ServiceType.DRY_CLEANING, amount: data.servicesData.dryCleaning.executorAmount, description: 'Химчистка' });
                    if (data.servicesData.polishing?.executorId)
                        assignments.push({ workOrderId: id, executorId: data.servicesData.polishing.executorId, workType: client_2.WorkType.SERVICE_POLISHING, serviceType: client_2.ServiceType.POLISHING, amount: data.servicesData.polishing.executorAmount, description: 'Полировка/Керамика' });
                    const wp = data.servicesData.wheelPainting;
                    if (wp) {
                        if (wp.dismounting?.executorId)
                            assignments.push({ workOrderId: id, executorId: wp.dismounting.executorId, workType: client_2.WorkType.SERVICE_WHEEL_PAINTING, serviceType: client_2.ServiceType.WHEEL_PAINTING, amount: wp.dismounting.amount || 0, description: 'Покраска дисков - Демонтаж' });
                        if (wp.mounting?.executorId)
                            assignments.push({ workOrderId: id, executorId: wp.mounting.executorId, workType: client_2.WorkType.SERVICE_WHEEL_PAINTING_MOUNTING, serviceType: client_2.ServiceType.WHEEL_PAINTING, amount: wp.mounting.amount || 0, description: 'Покраска дисков - Монтаж' });
                    }
                    const carbon = data.servicesData.carbon;
                    if (carbon?.executorId)
                        assignments.push({ workOrderId: id, executorId: carbon.executorId, workType: client_2.WorkType.SERVICE_CARBON, serviceType: client_2.ServiceType.CARBON, amount: carbon.price || 0, description: `Карбон - ${carbon.stage || ''} (${carbon.type || ''})`, metadata: carbon });
                    if (data.servicesData.soundproofing?.executorId)
                        assignments.push({ workOrderId: id, executorId: data.servicesData.soundproofing.executorId, workType: client_2.WorkType.SERVICE_SOUNDPROOFING, serviceType: client_2.ServiceType.SOUNDPROOFING, amount: data.servicesData.soundproofing.amount || 0, description: 'Шумоизоляция' });
                }
                if (additionalServices) {
                    typesToClean.push(client_2.WorkType.ARMATURA_ADDITIONAL);
                    for (const service of additionalServices) {
                        assignments.push({ workOrderId: id, executorId: service.executorId, workType: client_2.WorkType.ARMATURA_ADDITIONAL, amount: service.amount, description: service.name });
                    }
                }
                if (typesToClean.length > 0) {
                    await this.prisma.workOrderExecutor.deleteMany({
                        where: {
                            workOrderId: id,
                            workType: { in: typesToClean },
                            isPaid: false,
                        }
                    });
                }
                if (assignments.length > 0) {
                    const prepared = assignments.map(a => ({
                        ...a,
                        metadata: { ...(a.metadata || {}), status: a.metadata?.status || 'PENDING' },
                    }));
                    await this.prisma.workOrderExecutor.createMany({ data: prepared });
                }
            }
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: workOrderData,
            include: {
                request: true,
                manager: { select: { id: true, name: true, email: true } },
                master: { select: { id: true, name: true, email: true } },
                executor: { select: { id: true, name: true, email: true } },
                executorAssignments: {
                    include: {
                        executor: { select: { id: true, name: true, email: true } }
                    }
                }
            },
        });
    }
    async recalculateArmaturaPayments(workOrderId, newTotalAmount) {
        const armaturaWorks = await this.prisma.workOrderExecutor.findMany({
            where: {
                workOrderId,
                workType: {
                    in: ['ARMATURA_DISMANTLING', 'ARMATURA_DISASSEMBLY', 'ARMATURA_ASSEMBLY', 'ARMATURA_MOUNTING']
                }
            }
        });
        const percentages = {
            ARMATURA_DISMANTLING: 0.07,
            ARMATURA_DISASSEMBLY: 0.03,
            ARMATURA_ASSEMBLY: 0.03,
            ARMATURA_MOUNTING: 0.07,
        };
        for (const work of armaturaWorks) {
            const newAmount = newTotalAmount * percentages[work.workType];
            await this.prisma.workOrderExecutor.update({
                where: { id: work.id },
                data: { amount: newAmount }
            });
        }
        if (armaturaWorks.length > 0) {
            console.log(`Recalculated ${armaturaWorks.length} armatura payments for work order ${workOrderId}`);
        }
    }
    async delete(id) {
        return this.prisma.workOrder.delete({
            where: { id },
        });
    }
    async updateAssignmentStatus(workOrderId, assignmentId, status, currentUser) {
        if (currentUser.role !== 'EXECUTOR') {
            throw new common_1.ForbiddenException('Только исполнитель может менять статус задачи');
        }
        const assignment = await this.prisma.workOrderExecutor.findUnique({
            where: { id: assignmentId },
        });
        if (!assignment || assignment.workOrderId !== workOrderId) {
            throw new common_1.NotFoundException('Задача не найдена');
        }
        if (assignment.executorId !== currentUser.id) {
            throw new common_1.ForbiddenException('Можно менять только свои задачи');
        }
        const metadata = assignment.metadata ? { ...assignment.metadata } : {};
        metadata.status = status;
        if (!metadata.startedAt) {
            metadata.startedAt = new Date();
        }
        if (status === 'DONE' && !metadata.finishedAt) {
            metadata.finishedAt = new Date();
        }
        const updated = await this.prisma.workOrderExecutor.update({
            where: { id: assignmentId },
            data: { metadata },
        });
        const allAssignments = await this.prisma.workOrderExecutor.findMany({
            where: { workOrderId },
            select: { metadata: true },
        });
        const allDone = allAssignments.length > 0 && allAssignments.every(a => a.metadata?.status === 'DONE');
        if (allDone) {
            await this.prisma.workOrder.update({
                where: { id: workOrderId },
                data: { status: client_2.WorkOrderStatus.ASSIGNED_TO_MASTER },
            });
        }
        return updated;
    }
    async checkMasterAccess(workOrderId, masterId) {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { id: workOrderId },
            select: { masterId: true },
        });
        return workOrder?.masterId === masterId;
    }
    async assignMaster(id, masterId) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                masterId,
                status: client_2.WorkOrderStatus.ASSIGNED_TO_MASTER,
            },
            include: {
                master: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async assignExecutor(id, executorId) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                executorId,
                status: client_2.WorkOrderStatus.ASSIGNED_TO_EXECUTOR,
            },
            include: {
                executor: { select: { id: true, name: true, email: true } },
            },
        });
    }
    async startWork(id, currentUser) {
        if (!(0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new common_1.ForbiddenException('Недостаточно прав для изменения статуса');
        }
        const isExecutor = currentUser.role === 'EXECUTOR';
        const isSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
        if (!isExecutor && !isSupervisor) {
            throw new common_1.ForbiddenException('Только исполнитель может брать работу');
        }
        if (isExecutor) {
            const toStart = await this.prisma.workOrderExecutor.findMany({
                where: { workOrderId: id, executorId: currentUser.id },
                select: { id: true, metadata: true },
            });
            for (const item of toStart) {
                const meta = item.metadata || {};
                if (meta.status === 'DONE')
                    continue;
                if (!meta.startedAt) {
                    await this.prisma.workOrderExecutor.update({
                        where: { id: item.id },
                        data: { metadata: { ...meta, startedAt: new Date() } },
                    });
                }
            }
            const assignment = await this.prisma.workOrderExecutor.findFirst({
                where: { workOrderId: id, executorId: currentUser.id },
            });
            if (!assignment) {
                throw new common_1.ForbiddenException('Вы можете начать только назначенные вам работы');
            }
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: client_2.WorkOrderStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
        });
    }
    async submitForReview(id, currentUser) {
        if (!(0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new common_1.ForbiddenException('Недостаточно прав для изменения статуса');
        }
        if (currentUser.role !== 'EXECUTOR') {
            throw new common_1.ForbiddenException('Только исполнитель может завершать свою часть');
        }
        const assignment = await this.prisma.workOrderExecutor.findFirst({
            where: { workOrderId: id, executorId: currentUser.id },
        });
        if (!assignment) {
            throw new common_1.ForbiddenException('Вы можете завершать только назначенные вам работы');
        }
        return { ok: true };
    }
    async approve(id, currentUser) {
        throw new common_1.ForbiddenException('Этап проверки отключен');
    }
    async requestRevision(id, currentUser) {
        throw new common_1.ForbiddenException('Этап проверки отключен');
    }
    async complete(id, currentUser, finalStage) {
        if (!(0, permissions_1.hasPermission)(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new common_1.ForbiddenException('Недостаточно прав для изменения статуса');
        }
        if (!finalStage) {
            throw new common_1.BadRequestException('Не указан финальный этап');
        }
        const isSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
        const isMaster = currentUser.role === 'MASTER';
        if (!isSupervisor && !isMaster) {
            throw new common_1.ForbiddenException('Недостаточно прав для завершения заказ-наряда');
        }
        if (isMaster) {
            const hasAccess = await this.checkMasterAccess(id, currentUser.id);
            if (!hasAccess) {
                throw new common_1.ForbiddenException('Можно завершать только назначенные вам заказ-наряды');
            }
            const current = await this.prisma.workOrder.findUnique({
                where: { id },
                select: { status: true },
            });
            if (current?.status !== client_2.WorkOrderStatus.ASSIGNED_TO_MASTER) {
                throw new common_1.ForbiddenException('ЗН должен быть на этапе мастера для завершения');
            }
        }
        const stageToStatus = {
            ASSEMBLED: client_2.WorkOrderStatus.ASSEMBLED,
            SENT: client_2.WorkOrderStatus.SENT,
            ISSUED: client_2.WorkOrderStatus.ISSUED,
        };
        const nextStatus = stageToStatus[finalStage];
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: nextStatus,
                completedAt: new Date(),
            },
        });
    }
    async addPhotoBefore(id, photoUrl) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new Error('Work order not found');
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                photosBeforeWork: [...order.photosBeforeWork, photoUrl],
            },
        });
    }
    async addPhotoAfter(id, photoUrl) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new Error('Work order not found');
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                photosAfterWork: [...order.photosAfterWork, photoUrl],
            },
        });
    }
    async deletePhoto(id, photoUrl) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new common_1.NotFoundException('Work order not found');
        }
        const currentPhotos = order.photosAfterWork || [];
        const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);
        try {
            const fs = require('fs');
            const path = require('path');
            const filepath = path.join(process.cwd(), photoUrl);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        }
        catch (error) {
            console.error('Error deleting file:', error);
        }
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                photosAfterWork: updatedPhotos,
            },
        });
    }
};
exports.WorkOrdersService = WorkOrdersService;
exports.WorkOrdersService = WorkOrdersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        work_order_number_service_1.WorkOrderNumberService])
], WorkOrdersService);
//# sourceMappingURL=work-orders.service.js.map