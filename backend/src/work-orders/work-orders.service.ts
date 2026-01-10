import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException,
    BadRequestException,
    ForbiddenException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderNumberService } from './work-order-number.service';
import { PaymentMethod, CarCondition, WorkOrderStatus, WorkType, ServiceType } from '@prisma/client';
import { CurrentUser, hasPermission } from '../auth/permissions';

type TaskStatus = 'PENDING' | 'IN_PROGRESS' | 'DONE';

interface CreateWorkOrderDto {
    requestId?: number;
    managerId?: number;
    masterId?: number;

    // З/Н
    totalAmount: number;
    paymentMethod: PaymentMethod;

    // Customer & Car
    customerName: string;
    customerPhone: string;
    carBrand: string;
    carModel: string;
    vin?: string;
    carCondition: CarCondition;

    // Part counts
    blackCount?: number;
    carbonCount?: number;
    standardStructureCount?: number;

    // Armouring
    dismantling?: boolean;
    dismantlingPrice?: number;
    disassembly?: boolean;
    disassemblyPrice?: number;
    assembly?: boolean;
    assemblyPrice?: number;
    mounting?: boolean;
    mountingPrice?: number;

    // Parts - Front
    radiatorGrille?: boolean;
    fogLights?: boolean;
    frontBumper?: boolean;
    lip?: boolean;
    hood?: boolean;

    // Parts - Side
    windowMoldings?: boolean;
    doorMoldings?: boolean;
    vents?: boolean;
    fenders?: boolean;
    doorHandles?: boolean;
    mirrors?: boolean;

    // Parts - Rear
    trunkLid?: boolean;
    spoiler?: boolean;
    rearBumper?: boolean;
    diffuser?: boolean;
    rearLights?: boolean;
    fakeExhausts?: boolean;

    // Parts - Other
    badges?: boolean;
    inscriptions?: boolean;
    hubCaps?: boolean;
    railings?: boolean;
    sills?: boolean;
    wheels?: boolean;
    nozzles?: boolean;

    // NEW: JSON данные для услуг (опционально)
    servicesData?: {
        film?: { executorId: number; amount: number };
        dryCleaning?: { executorId: number; serviceAmount: number; executorAmount: number };
        polishing?: { executorId: number; serviceAmount: number; executorAmount: number };
        wheelPainting?: {
            amount?: number;
            payoutAmount?: number;
            dismounting?: { executorId?: number; amount?: number };
            mounting?: { executorId?: number; amount?: number };
        };
        carbon?: {
            executorId: number;
            stage: string;
            type?: string;
            comment: string;
            partsCount: number;
            price: number;
            serviceAmount?: number;
        };
        soundproofing?: {
            executorId: number;
            amount: number;
        };
        bonus?: {
            executorId: number;
            amount: number;
            comment: string;
        };
    };

    // NEW: JSON данные для деталей кузова (опционально)
    bodyPartsData?: {
        [key: string]: {
            quantity: number;
            actualQuantity: number;
            status: string;
            executorId?: number;
            letterCount?: number;
        };
    };

    // NEW: Исполнители для этапов арматурки (опционально)
    armaturaExecutors?: {
        dismantling?: number;
        disassembly?: number;
        assembly?: number;
        mounting?: number;
    };

    // NEW: Фиксированные услуги (опционально)
    fixedServices?: {
        brakeCalipers?: { removedBy?: number; installedBy?: number };
        wheels?: { removedBy?: number; installedBy?: number };
    };

    // NEW: Дополнительные услуги к арматурке (опционально)
    additionalServices?: Array<{
        name: string;
        executorId: number;
        amount: number;
    }>;
}

@Injectable()
export class WorkOrdersService {
    constructor(
        private prisma: PrismaService,
        private numberService: WorkOrderNumberService,
    ) { }

    private hasExecutorTaskInJson(order: any, executorId: number): boolean {
        const services = order.servicesData || {};
        const serviceHasExecutor = Object.values<any>(services).some((entry: any) => {
            if (!entry) return false;
            if (typeof entry === 'object' && entry.executorId) {
                return entry.executorId === executorId;
            }
            // nested wheelPainting structure
            if (entry.dismounting?.executorId === executorId) return true;
            if (entry.mounting?.executorId === executorId) return true;
            return false;
        });

        if (serviceHasExecutor) return true;

        const bodyParts = order.bodyPartsData || {};
        return Object.values<any>(bodyParts).some((entry: any) => entry?.executorId === executorId);
    }

    private hasExecutorTasksInPayload(data: Partial<CreateWorkOrderDto>): boolean {
        if (data.armaturaExecutors) {
            const { dismantling, disassembly, assembly, mounting } = data.armaturaExecutors;
            if (dismantling || disassembly || assembly || mounting) return true;
        }

        if (data.fixedServices) {
            const { brakeCalipers, wheels } = data.fixedServices;
            if (brakeCalipers?.removedBy || brakeCalipers?.installedBy || wheels?.removedBy || wheels?.installedBy) return true;
        }

        if (data.additionalServices?.length) return true;

        if (data.bodyPartsData) {
            const hasBodyExec = Object.values<any>(data.bodyPartsData).some((entry: any) => entry?.executorId);
            if (hasBodyExec) return true;
        }

        if (data.servicesData) {
            const s = data.servicesData;
            if (s.film?.executorId) return true;
            if (s.dryCleaning?.executorId) return true;
            if (s.polishing?.executorId) return true;
            if (s.wheelPainting?.dismounting?.executorId || s.wheelPainting?.mounting?.executorId) return true;
            if (s.carbon?.executorId) return true;
            if (s.soundproofing?.executorId) return true;
            if (s.bonus?.executorId) return true;
        }

        return false;
    }

    private stripFinanceIfNeeded(orders: any[], currentUser: CurrentUser) {
        if (hasPermission(currentUser, 'WORK_ORDERS_VIEW_FINANCE')) {
            return orders;
        }

        return orders.map(order => {
            const clone: any = { ...order };
            delete clone.totalAmount;
            delete clone.paymentMethod;
            if (clone.executorAssignments) {
                clone.executorAssignments = clone.executorAssignments.map((a: any) => {
                    const { amount, isPaid, paidAmount, ...rest } = a;
                    return rest;
                });
            }
            return clone;
        });
    }


    async create(data: CreateWorkOrderDto, currentUser?: CurrentUser) {
        try {
            console.log('Creating work order with data:', data);
            
            // Если передан requestId и нет managerId (мастер создает), получить managerId из заявки
            let finalManagerId = data.managerId;
            if (data.requestId && !finalManagerId) {
                const request = await this.prisma.request.findUnique({
                    where: { id: data.requestId },
                    select: { managerId: true }
                });
                if (request?.managerId) {
                    finalManagerId = request.managerId;
                } else {
                    throw new NotFoundException('У заявки не указан менеджер. Невозможно создать заказ-наряд.');
                }
            }

            // Проверка, что managerId установлен (обязательное поле в Prisma)
            if (!finalManagerId) {
                throw new BadRequestException('Необходимо указать менеджера (managerId)');
            }

            const orderNumber = await this.numberService.generateNumber();
            console.log('Generated order number:', orderNumber);

            const totalAmount = data.totalAmount;

            // Удалить новые поля из data перед передачей в Prisma
            const { armaturaExecutors, fixedServices, additionalServices, masterId, ...workOrderData } = data;

            // 1. Создать WorkOrder с JSON полями
            const finalMasterId = masterId || (data as any).masterId;
            const hasExecutorTasks = this.hasExecutorTasksInPayload(data);
            const initialStatus = hasExecutorTasks
                ? WorkOrderStatus.ASSIGNED_TO_EXECUTOR
                : (finalMasterId ? WorkOrderStatus.ASSIGNED_TO_MASTER : WorkOrderStatus.NEW);

            const result = await this.prisma.workOrder.create({
                data: {
                    ...workOrderData,
                    managerId: finalManagerId, // Используем managerId из заявки или переданный
                    masterId: finalMasterId, // Устанавливаем masterId если передан
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

            // 2. Создать WorkOrderExecutor записи
            const assignments: any[] = [];

            // Арматурка (7%, 3%, 3%, 7% от totalAmount)
            if (armaturaExecutors) {
                if (armaturaExecutors.dismantling) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.dismantling,
                        workType: WorkType.ARMATURA_DISMANTLING,
                        amount: totalAmount * 0.07,
                        description: 'Демонтаж',
                    });
                }
                if (armaturaExecutors.disassembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.disassembly,
                        workType: WorkType.ARMATURA_DISASSEMBLY,
                        amount: totalAmount * 0.03,
                        description: 'Разборка',
                    });
                }
                if (armaturaExecutors.assembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.assembly,
                        workType: WorkType.ARMATURA_ASSEMBLY,
                        amount: totalAmount * 0.03,
                        description: 'Сборка',
                    });
                }
                if (armaturaExecutors.mounting) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.mounting,
                        workType: WorkType.ARMATURA_MOUNTING,
                        amount: totalAmount * 0.07,
                        description: 'Монтаж',
                    });
                }
            }

            // Фиксированные услуги
            if (fixedServices) {
                if (fixedServices.brakeCalipers) {
                    if (fixedServices.brakeCalipers.removedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.brakeCalipers.removedBy,
                            workType: WorkType.FIXED_BRAKE_CALIPERS_REMOVE,
                            amount: 2500,
                            description: 'Арматура суппортов - снял',
                        });
                    }
                    if (fixedServices.brakeCalipers.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.brakeCalipers.installedBy,
                            workType: WorkType.FIXED_BRAKE_CALIPERS_INSTALL,
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
                            workType: WorkType.FIXED_WHEELS_REMOVE,
                            amount: 500,
                            description: 'Колёса - снял',
                        });
                    }
                    if (fixedServices.wheels.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.wheels.installedBy,
                            workType: WorkType.FIXED_WHEELS_INSTALL,
                            amount: 500,
                            description: 'Колёса - поставил',
                        });
                    }
                }
            }

            // Детали кузова (400₽ за деталь)
            if (data.bodyPartsData) {
                for (const [partType, partData] of Object.entries(data.bodyPartsData)) {
                    if (partData.executorId && partData.quantity > 0) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: partData.executorId,
                            workType: WorkType.BODY_PART,
                            amount: partData.quantity * 400,
                            description: partType,
                            metadata: partData,
                        });
                    }
                }
            }

            // Услуги
            if (data.servicesData) {
                if (data.servicesData.film?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.film.executorId,
                        workType: WorkType.SERVICE_FILM,
                        serviceType: ServiceType.FILM,
                        amount: data.servicesData.film.amount,
                        description: 'Плёнка',
                    });
                }
                if (data.servicesData.dryCleaning?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.dryCleaning.executorId,
                        workType: WorkType.SERVICE_DRY_CLEANING,
                        serviceType: ServiceType.DRY_CLEANING,
                        amount: data.servicesData.dryCleaning.executorAmount,
                        description: 'Химчистка',
                    });
                }
                if (data.servicesData.polishing?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.polishing.executorId,
                        workType: WorkType.SERVICE_POLISHING,
                        serviceType: ServiceType.POLISHING,
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
                            workType: WorkType.SERVICE_WHEEL_PAINTING,
                            serviceType: ServiceType.WHEEL_PAINTING,
                            amount: wp.dismounting.amount || 0,
                            description: 'Покраска дисков - Демонтаж',
                        });
                    }
                    if (wp.mounting?.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.mounting.executorId,
                            workType: WorkType.SERVICE_WHEEL_PAINTING_MOUNTING,
                            serviceType: ServiceType.WHEEL_PAINTING,
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
                            workType: WorkType.SERVICE_CARBON,
                            serviceType: ServiceType.CARBON,
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
                        workType: WorkType.SERVICE_SOUNDPROOFING,
                        serviceType: ServiceType.SOUNDPROOFING,
                        amount: data.servicesData.soundproofing.amount || 0,
                        description: 'Шумоизоляция',
                    });
                }
                // Существует ли бонус? Если пришел в servicesData.bonus
                if (data.servicesData.bonus?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.bonus.executorId,
                        workType: WorkType.SERVICE_BONUS,
                        amount: data.servicesData.bonus.amount || 0,
                        description: data.servicesData.bonus.comment || 'Дополнительная выплата / бонус',
                    });
                }
            }

            // Дополнительные услуги
            if (additionalServices?.length) {
                for (const service of additionalServices) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: service.executorId,
                        workType: WorkType.ARMATURA_ADDITIONAL,
                        amount: service.amount,
                        description: service.name,
                    });
                }
            }

            // 3. Создать все назначения одним запросом
            if (assignments.length > 0) {
                const prepared = assignments.map(a => ({
                    ...a,
                    metadata: { ...(a.metadata || {}), status: (a.metadata as any)?.status || 'PENDING' },
                }));
                await this.prisma.workOrderExecutor.createMany({
                    data: prepared,
                });
                console.log(`Created ${assignments.length} executor assignments`);
            }

            console.log('Work order created successfully:', result.id);
            return result;
        } catch (error) {
            console.error('Error creating work order:', error);

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log('Prisma error code:', error.code);
                if (error.code === 'P2003') {
                    throw new NotFoundException(`Request or Manager not found. Details: ${error.meta?.field_name}`);
                }
                if (error.code === 'P2002') {
                    throw new ConflictException('Work order number already exists');
                }
            }

            throw new InternalServerErrorException(`Failed to create work order: ${error.message}`);
        }
    }

    async findAll(currentUser: CurrentUser, view?: string, search?: string) {
        const searchTerm = search?.trim();
        const searchNumber = searchTerm ? Number(searchTerm) : null;

        const buildSearchWhere = () => {
            if (!searchTerm) return undefined;
            const or: any[] = [
                { orderNumber: { contains: searchTerm, mode: 'insensitive' } },
                { carBrand: { contains: searchTerm, mode: 'insensitive' } },
                { carModel: { contains: searchTerm, mode: 'insensitive' } },
                { customerName: { contains: searchTerm, mode: 'insensitive' } },
                { customerPhone: { contains: searchTerm, mode: 'insensitive' } },
            ];
            if (Number.isFinite(searchNumber)) {
                or.push({ id: searchNumber as number });
            }
            return { OR: or };
        };

        const filterBySearch = (orders: any[]) => {
            if (!searchTerm) return orders;
            const term = searchTerm.toLowerCase();
            return orders.filter(o =>
                o.orderNumber?.toLowerCase().includes(term) ||
                o.carBrand?.toLowerCase().includes(term) ||
                o.carModel?.toLowerCase().includes(term) ||
                o.customerName?.toLowerCase().includes(term) ||
                o.customerPhone?.toLowerCase().includes(term) ||
                (Number.isFinite(searchNumber) && o.id === searchNumber)
            );
        };

        const baseInclude = {
            request: true,
            manager: { select: { id: true, name: true, email: true } },
            master: { select: { id: true, name: true, email: true } },
            executor: { select: { id: true, name: true, email: true } },
        };

        if (hasPermission(currentUser, 'WORK_ORDERS_VIEW_ALL')) {
            const where: any = buildSearchWhere() || {};
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

        if (!hasPermission(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            throw new ForbiddenException('Недостаточно прав для просмотра заказ-нарядов');
        }

        if (currentUser.role === 'MASTER') {
            const where: any = { masterId: currentUser.id, ...(buildSearchWhere() || {}) };
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

        // fallback: manager sees only own
        const where: any = { managerId: currentUser.id, ...(buildSearchWhere() || {}) };
        const managerOrders = await this.prisma.workOrder.findMany({
            where,
            include: baseInclude,
            orderBy: { createdAt: 'desc' },
        });
        return this.stripFinanceIfNeeded(managerOrders, currentUser);
    }

    async findOne(id: number, currentUser: CurrentUser) {
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

        if (!order) return null;

        const canViewAll = hasPermission(currentUser, 'WORK_ORDERS_VIEW_ALL');
        let canViewOwn = false;

        if (hasPermission(currentUser, 'WORK_ORDERS_VIEW_OWN')) {
            if (currentUser.role === 'MASTER' && order.masterId === currentUser.id) {
                canViewOwn = true;
            } else if (currentUser.role === 'EXECUTOR') {
                const hasAssignment = order.executorAssignments?.some(a => a.executorId === currentUser.id) || false;
                const hasJsonTask = this.hasExecutorTaskInJson(order, currentUser.id);
                canViewOwn = hasAssignment || hasJsonTask;
                if (order.executorAssignments) {
                    order.executorAssignments = order.executorAssignments.filter(a => a.executorId === currentUser.id);
                }
            } else if (order.managerId === currentUser.id) {
                canViewOwn = true;
            }
        }

        if (!canViewAll && !canViewOwn) {
            throw new NotFoundException('Work order not found or access denied');
        }

        // Reconstruct DTO objects from executorAssignments AND flat fields
        const armaturaExecutors: any = {};
        const fixedServices: any = {};
        const additionalServices: any[] = [];

        // Helper to find assignment
        const findAssignment = (type: string) => order.executorAssignments?.find(a => a.workType === type);

        // Armatura Reconstruction
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

        // Fixed Services
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

        // Additional Services
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

        // Build result object
        // Compute per-assignment duration and executor totals
        const executorTotals: Record<number, { seconds: number }> = {};
        if (order.executorAssignments) {
            order.executorAssignments = order.executorAssignments.map(a => {
                const meta = (a.metadata as any) || {};
                let seconds = 0;
                if (meta.startedAt) {
                    const start = new Date(meta.startedAt);
                    const end = meta.finishedAt ? new Date(meta.finishedAt) : new Date();
                    seconds = Math.max(0, Math.floor((end.getTime() - start.getTime()) / 1000));
                }
                if (a.executorId) {
                    if (!executorTotals[a.executorId]) executorTotals[a.executorId] = { seconds: 0 };
                    executorTotals[a.executorId].seconds += seconds;
                }
                (a as any).durationSeconds = seconds;
                return a;
            });
        }

        const result: any = {
            ...order,
            armaturaExecutors: Object.keys(armaturaExecutors).length > 0 ? armaturaExecutors : undefined,
            fixedServices: Object.keys(fixedServices).length > 0 ? fixedServices : undefined,
            additionalServices: additionalServices.length > 0 ? additionalServices : undefined,
            executorTimers: executorTotals,
        };

        const canViewFinance = hasPermission(currentUser, 'WORK_ORDERS_VIEW_FINANCE');
        if (!canViewFinance) {
            // hide global finance
            delete result.totalAmount;
            delete result.paymentMethod;
            // hide prices in armaturaExecutors
            if (result.armaturaExecutors) {
                Object.keys(result.armaturaExecutors).forEach(key => {
                    if (result.armaturaExecutors[key]) {
                        delete result.armaturaExecutors[key].price;
                    }
                });
            }
            // hide amounts in additional services blob
            if (result.additionalServices) {
                result.additionalServices = result.additionalServices.map((s: any) => {
                    const { amount, ...rest } = s;
                    return rest;
                });
            }

            if (result.executorAssignments) {
                if (currentUser.role === 'MASTER') {
                    // master sees all assignments without finance
                    result.executorAssignments = result.executorAssignments.map((a: any) => {
                        const { amount, isPaid, paidAmount, ...rest } = a;
                        return rest;
                    });
                } else if (currentUser.role === 'EXECUTOR') {
                    // executor sees only own assignments with amount; others without amounts
                    result.executorAssignments = result.executorAssignments
                        .filter((a: any) => a.executorId === currentUser.id) // keep only own for clarity
                        .map((a: any) => {
                            const { isPaid, paidAmount, ...rest } = a;
                            return rest;
                        });
                }
            }
        } else {
            // finance allowed: keep as is
        }

        return result;
    }

    async update(id: number, data: Partial<CreateWorkOrderDto>, currentUser: CurrentUser) {
        const canEditAll = hasPermission(currentUser, 'WORK_ORDERS_EDIT_ALL');
        const canEditAssigned = hasPermission(currentUser, 'WORK_ORDERS_EDIT_ASSIGNED');

        if (!canEditAll && !canEditAssigned) {
            throw new ForbiddenException('Недостаточно прав для редактирования заказ-наряда');
        }

        if (!canEditAll && canEditAssigned) {
            const workOrder = await this.prisma.workOrder.findUnique({
                where: { id },
                select: { masterId: true },
            });
            if (!workOrder || workOrder.masterId !== currentUser.id) {
                throw new ForbiddenException('Можно редактировать только назначенные вам заказ-наряды');
            }

            // Убираем финансовые поля, если нет права на просмотр/редактирование финансов
            const { totalAmount, paymentMethod, ...rest } = data;
            data = rest;
            if (data.armaturaExecutors) {
                Object.keys(data.armaturaExecutors).forEach(key => {
                    if (data.armaturaExecutors?.[key as keyof typeof data.armaturaExecutors]) {
                        delete (data.armaturaExecutors as any)[key].price;
                    }
                });
            }
        }

        const canViewFinance = hasPermission(currentUser, 'WORK_ORDERS_VIEW_FINANCE');
        if (!canViewFinance) {
            const { totalAmount, paymentMethod, ...rest } = data;
            data = rest;
        }

        // 1. Recalculate armatura if totalAmount changed
        if (data.totalAmount) {
            await this.recalculateArmaturaPayments(id, data.totalAmount);
        }

        // 2. Sync assignments if needed
        const { armaturaExecutors, fixedServices, additionalServices, ...workOrderData } = data;

        // If specific data structures are provided, we should ideally sync assignments.
        // For simplicity and correctness, let's recreate assignments for the sections provided.
        // Note: In a real system we'd handle "isPaid" status, but here we'll follow the requested structure logic.

        if (data.servicesData || data.bodyPartsData || armaturaExecutors || fixedServices || additionalServices) {
            const result = await this.prisma.workOrder.findUnique({ where: { id } });
            if (result) {
                const assignments: any[] = [];
                const totalAmount = data.totalAmount || result.totalAmount;

                // Define types to clean up
                const typesToClean: WorkType[] = [];

                if (armaturaExecutors) {
                    typesToClean.push(WorkType.ARMATURA_DISMANTLING, WorkType.ARMATURA_DISASSEMBLY, WorkType.ARMATURA_ASSEMBLY, WorkType.ARMATURA_MOUNTING);
                    if (armaturaExecutors.dismantling) assignments.push({ workOrderId: id, executorId: armaturaExecutors.dismantling, workType: WorkType.ARMATURA_DISMANTLING, amount: totalAmount * 0.07, description: 'Демонтаж' });
                    if (armaturaExecutors.disassembly) assignments.push({ workOrderId: id, executorId: armaturaExecutors.disassembly, workType: WorkType.ARMATURA_DISASSEMBLY, amount: totalAmount * 0.03, description: 'Разборка' });
                    if (armaturaExecutors.assembly) assignments.push({ workOrderId: id, executorId: armaturaExecutors.assembly, workType: WorkType.ARMATURA_ASSEMBLY, amount: totalAmount * 0.03, description: 'Сборка' });
                    if (armaturaExecutors.mounting) assignments.push({ workOrderId: id, executorId: armaturaExecutors.mounting, workType: WorkType.ARMATURA_MOUNTING, amount: totalAmount * 0.07, description: 'Монтаж' });
                }

                if (fixedServices) {
                    typesToClean.push(WorkType.FIXED_BRAKE_CALIPERS_REMOVE, WorkType.FIXED_BRAKE_CALIPERS_INSTALL, WorkType.FIXED_WHEELS_REMOVE, WorkType.FIXED_WHEELS_INSTALL);
                    if (fixedServices.brakeCalipers?.removedBy) assignments.push({ workOrderId: id, executorId: fixedServices.brakeCalipers.removedBy, workType: WorkType.FIXED_BRAKE_CALIPERS_REMOVE, amount: 2500, description: 'Арматура суппортов - снял' });
                    if (fixedServices.brakeCalipers?.installedBy) assignments.push({ workOrderId: id, executorId: fixedServices.brakeCalipers.installedBy, workType: WorkType.FIXED_BRAKE_CALIPERS_INSTALL, amount: 2500, description: 'Арматура суппортов - поставил' });
                    if (fixedServices.wheels?.removedBy) assignments.push({ workOrderId: id, executorId: fixedServices.wheels.removedBy, workType: WorkType.FIXED_WHEELS_REMOVE, amount: 500, description: 'Колёса - снял' });
                    if (fixedServices.wheels?.installedBy) assignments.push({ workOrderId: id, executorId: fixedServices.wheels.installedBy, workType: WorkType.FIXED_WHEELS_INSTALL, amount: 500, description: 'Колёса - поставил' });
                }

                if (data.bodyPartsData) {
                    typesToClean.push(WorkType.BODY_PART);
                    for (const [partType, partData] of Object.entries(data.bodyPartsData)) {
                        if (partData.executorId && partData.quantity > 0) {
                            assignments.push({ workOrderId: id, executorId: partData.executorId, workType: WorkType.BODY_PART, amount: partData.quantity * 400, description: partType, metadata: partData });
                        }
                    }
                }

                if (data.servicesData) {
                    typesToClean.push(WorkType.SERVICE_FILM, WorkType.SERVICE_DRY_CLEANING, WorkType.SERVICE_POLISHING, WorkType.SERVICE_WHEEL_PAINTING, WorkType.SERVICE_WHEEL_PAINTING_MOUNTING, WorkType.SERVICE_WHEEL_PAINTING_CAPS, WorkType.SERVICE_CARBON, WorkType.SERVICE_SOUNDPROOFING, WorkType.SERVICE_BONUS);

                    if (data.servicesData.film?.executorId) assignments.push({ workOrderId: id, executorId: data.servicesData.film.executorId, workType: WorkType.SERVICE_FILM, serviceType: ServiceType.FILM, amount: data.servicesData.film.amount, description: 'Плёнка' });
                    if (data.servicesData.dryCleaning?.executorId) assignments.push({ workOrderId: id, executorId: data.servicesData.dryCleaning.executorId, workType: WorkType.SERVICE_DRY_CLEANING, serviceType: ServiceType.DRY_CLEANING, amount: data.servicesData.dryCleaning.executorAmount, description: 'Химчистка' });
                    if (data.servicesData.polishing?.executorId) assignments.push({ workOrderId: id, executorId: data.servicesData.polishing.executorId, workType: WorkType.SERVICE_POLISHING, serviceType: ServiceType.POLISHING, amount: data.servicesData.polishing.executorAmount, description: 'Полировка/Керамика' });

                    const wp = data.servicesData.wheelPainting;
                    if (wp) {
                        if (wp.dismounting?.executorId) assignments.push({ workOrderId: id, executorId: wp.dismounting.executorId, workType: WorkType.SERVICE_WHEEL_PAINTING, serviceType: ServiceType.WHEEL_PAINTING, amount: wp.dismounting.amount || 0, description: 'Покраска дисков - Демонтаж' });
                        if (wp.mounting?.executorId) assignments.push({ workOrderId: id, executorId: wp.mounting.executorId, workType: WorkType.SERVICE_WHEEL_PAINTING_MOUNTING, serviceType: ServiceType.WHEEL_PAINTING, amount: wp.mounting.amount || 0, description: 'Покраска дисков - Монтаж' });
                    }

                    const carbon = data.servicesData.carbon;
                    if (carbon?.executorId) assignments.push({ workOrderId: id, executorId: carbon.executorId, workType: WorkType.SERVICE_CARBON, serviceType: ServiceType.CARBON, amount: carbon.price || 0, description: `Карбон - ${carbon.stage || ''} (${carbon.type || ''})`, metadata: carbon });
                    if (data.servicesData.soundproofing?.executorId) assignments.push({ workOrderId: id, executorId: data.servicesData.soundproofing.executorId, workType: WorkType.SERVICE_SOUNDPROOFING, serviceType: ServiceType.SOUNDPROOFING, amount: data.servicesData.soundproofing.amount || 0, description: 'Шумоизоляция' });
                }

                if (additionalServices) {
                    typesToClean.push(WorkType.ARMATURA_ADDITIONAL);
                    for (const service of additionalServices) {
                        assignments.push({ workOrderId: id, executorId: service.executorId, workType: WorkType.ARMATURA_ADDITIONAL, amount: service.amount, description: service.name });
                    }
                }

                // Execute cleanup and recreation
                if (typesToClean.length > 0) {
                    await this.prisma.workOrderExecutor.deleteMany({
                        where: {
                            workOrderId: id,
                            workType: { in: typesToClean },
                            isPaid: false, // Only delete unpaid ones to avoid data loss if accounting already started
                        }
                    });
                }

                if (assignments.length > 0) {
                    const prepared = assignments.map(a => ({
                        ...a,
                        metadata: { ...(a.metadata || {}), status: (a.metadata as any)?.status || 'PENDING' },
                    }));
                    await this.prisma.workOrderExecutor.createMany({ data: prepared });
                }
            }
        }

        return this.prisma.workOrder.update({
            where: { id },
            data: workOrderData as any,
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

    /**
     * Пересчитывает ЗП исполнителей по арматурке при изменении totalAmount
     * Проценты: Демонтаж 7%, Разборка 3%, Сборка 3%, Монтаж 7%
     */
    private async recalculateArmaturaPayments(workOrderId: number, newTotalAmount: number) {
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
            const newAmount = newTotalAmount * percentages[work.workType as keyof typeof percentages];
            await this.prisma.workOrderExecutor.update({
                where: { id: work.id },
                data: { amount: newAmount }
            });
        }

        if (armaturaWorks.length > 0) {
            console.log(`Recalculated ${armaturaWorks.length} armatura payments for work order ${workOrderId}`);
        }
    }

    async delete(id: number) {
        return this.prisma.workOrder.delete({
            where: { id },
        });
    }

    async updateAssignmentStatus(workOrderId: number, assignmentId: number, status: TaskStatus, currentUser: CurrentUser) {
        if (currentUser.role !== 'EXECUTOR') {
            throw new ForbiddenException('Только исполнитель может менять статус задачи');
        }

        const assignment = await this.prisma.workOrderExecutor.findUnique({
            where: { id: assignmentId },
        });

        if (!assignment || assignment.workOrderId !== workOrderId) {
            throw new NotFoundException('Задача не найдена');
        }

        if (assignment.executorId !== currentUser.id) {
            throw new ForbiddenException('Можно менять только свои задачи');
        }

        const metadata = assignment.metadata ? { ...(assignment.metadata as any) } : {};
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

        // After status change, check if all tasks are DONE -> return to master stage
        const allAssignments = await this.prisma.workOrderExecutor.findMany({
            where: { workOrderId },
            select: { metadata: true },
        });

        const allDone = allAssignments.length > 0 && allAssignments.every(a => (a.metadata as any)?.status === 'DONE');
        if (allDone) {
            await this.prisma.workOrder.update({
                where: { id: workOrderId },
                data: { status: WorkOrderStatus.ASSIGNED_TO_MASTER },
            });
        }

        return updated;
    }

    // Check if master has access to work order
    async checkMasterAccess(workOrderId: number, masterId: number): Promise<boolean> {
        const workOrder = await this.prisma.workOrder.findUnique({
            where: { id: workOrderId },
            select: { masterId: true },
        });
        return workOrder?.masterId === masterId;
    }

    // Assignment methods
    async assignMaster(id: number, masterId: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                masterId,
                status: WorkOrderStatus.ASSIGNED_TO_MASTER,
            },
            include: {
                master: { select: { id: true, name: true, email: true } },
            },
        });
    }

    async assignExecutor(id: number, executorId: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                executorId,
                status: WorkOrderStatus.ASSIGNED_TO_EXECUTOR,
            },
            include: {
                executor: { select: { id: true, name: true, email: true } },
            },
        });
    }

    // Workflow methods
    async startWork(id: number, currentUser: CurrentUser) {
        if (!hasPermission(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new ForbiddenException('Недостаточно прав для изменения статуса');
        }

        const isExecutor = currentUser.role === 'EXECUTOR';
        const isSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';

        if (!isExecutor && !isSupervisor) {
            throw new ForbiddenException('Только исполнитель может брать работу');
        }

        if (isExecutor) {
            // mark startedAt for this executor's active tasks (skip already DONE)
            const toStart = await this.prisma.workOrderExecutor.findMany({
                where: { workOrderId: id, executorId: currentUser.id },
                select: { id: true, metadata: true },
            });
            for (const item of toStart) {
                const meta = (item.metadata as any) || {};
                if (meta.status === 'DONE') continue;
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
                throw new ForbiddenException('Вы можете начать только назначенные вам работы');
            }
        }

        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
        });
    }

    async submitForReview(id: number, currentUser: CurrentUser) {
        if (!hasPermission(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new ForbiddenException('Недостаточно прав для изменения статуса');
        }

        if (currentUser.role !== 'EXECUTOR') {
            throw new ForbiddenException('Только исполнитель может завершать свою часть');
        }

        const assignment = await this.prisma.workOrderExecutor.findFirst({
            where: { workOrderId: id, executorId: currentUser.id },
        });
        if (!assignment) {
            throw new ForbiddenException('Вы можете завершать только назначенные вам работы');
        }

        // Не меняем статус заказа-наряда, исполнитель отмечает завершение через задачи
        return { ok: true };
    }

    async approve(id: number, currentUser: CurrentUser) {
        throw new ForbiddenException('Этап проверки отключен');
    }

    async requestRevision(id: number, currentUser: CurrentUser) {
        throw new ForbiddenException('Этап проверки отключен');
    }

    async complete(id: number, currentUser: CurrentUser, finalStage: 'ASSEMBLED' | 'SENT' | 'ISSUED') {
        if (!hasPermission(currentUser, 'WORK_ORDERS_CHANGE_STATUS')) {
            throw new ForbiddenException('Недостаточно прав для изменения статуса');
        }

        if (!finalStage) {
            throw new BadRequestException('Не указан финальный этап');
        }

        const isSupervisor = currentUser.role === 'ADMIN' || currentUser.role === 'MANAGER';
        const isMaster = currentUser.role === 'MASTER';

        if (!isSupervisor && !isMaster) {
            throw new ForbiddenException('Недостаточно прав для завершения заказ-наряда');
        }

        if (isMaster) {
            const hasAccess = await this.checkMasterAccess(id, currentUser.id);
            if (!hasAccess) {
                throw new ForbiddenException('Можно завершать только назначенные вам заказ-наряды');
            }

            const current = await this.prisma.workOrder.findUnique({
                where: { id },
                select: { status: true },
            });
            if (current?.status !== WorkOrderStatus.ASSIGNED_TO_MASTER) {
                throw new ForbiddenException('ЗН должен быть на этапе мастера для завершения');
            }
        }

        // Map final stage to status
        const stageToStatus: Record<typeof finalStage, WorkOrderStatus> = {
            ASSEMBLED: WorkOrderStatus.ASSEMBLED,
            SENT: WorkOrderStatus.SENT,
            ISSUED: WorkOrderStatus.ISSUED,
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

    // Photo management
    async addPhotoBefore(id: number, photoUrl: string) {
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

    async addPhotoAfter(id: number, photoUrl: string) {
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

    // Photo report methods
    async deletePhoto(id: number, photoUrl: string) {
        const order = await this.prisma.workOrder.findUnique({ where: { id } });
        if (!order) {
            throw new NotFoundException('Work order not found');
        }

        const currentPhotos = order.photosAfterWork || [];
        const updatedPhotos = currentPhotos.filter(url => url !== photoUrl);

        // Optionally delete file from filesystem
        try {
            const fs = require('fs');
            const path = require('path');
            const filepath = path.join(process.cwd(), photoUrl);
            if (fs.existsSync(filepath)) {
                fs.unlinkSync(filepath);
            }
        } catch (error) {
            console.error('Error deleting file:', error);
        }

        return this.prisma.workOrder.update({
            where: { id },
            data: {
                photosAfterWork: updatedPhotos,
            },
        });
    }
}
