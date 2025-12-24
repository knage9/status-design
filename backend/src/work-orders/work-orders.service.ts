import {
    Injectable,
    NotFoundException,
    ConflictException,
    InternalServerErrorException
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { WorkOrderNumberService } from './work-order-number.service';
import { PaymentMethod, CarCondition, WorkOrderStatus } from '@prisma/client';

interface CreateWorkOrderDto {
    requestId: number;
    managerId: number;

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
            mainExecutorId?: number;
            amount?: number;
            mounting?: { executorId?: number; amount?: number };
            caps?: { executorId?: number; amount?: number };
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

    async create(data: CreateWorkOrderDto) {
        try {
            console.log('Creating work order with data:', data);
            const orderNumber = await this.numberService.generateNumber();
            console.log('Generated order number:', orderNumber);

            const totalAmount = data.totalAmount;

            // Удалить новые поля из data перед передачей в Prisma
            const { armaturaExecutors, fixedServices, additionalServices, ...workOrderData } = data;

            // 1. Создать WorkOrder с JSON полями
            const result = await this.prisma.workOrder.create({
                data: {
                    ...workOrderData,
                    orderNumber,
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
                        workType: 'ARMATURA_DISMANTLING',
                        amount: totalAmount * 0.07,
                        description: 'Демонтаж',
                    });
                }
                if (armaturaExecutors.disassembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.disassembly,
                        workType: 'ARMATURA_DISASSEMBLY',
                        amount: totalAmount * 0.03,
                        description: 'Разборка',
                    });
                }
                if (armaturaExecutors.assembly) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.assembly,
                        workType: 'ARMATURA_ASSEMBLY',
                        amount: totalAmount * 0.03,
                        description: 'Сборка',
                    });
                }
                if (armaturaExecutors.mounting) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: armaturaExecutors.mounting,
                        workType: 'ARMATURA_MOUNTING',
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
                            workType: 'FIXED_BRAKE_CALIPERS_REMOVE',
                            amount: 2500,
                            description: 'Арматура суппортов - снял',
                        });
                    }
                    if (fixedServices.brakeCalipers.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.brakeCalipers.installedBy,
                            workType: 'FIXED_BRAKE_CALIPERS_INSTALL',
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
                            workType: 'FIXED_WHEELS_REMOVE',
                            amount: 500,
                            description: 'Колёса - снял',
                        });
                    }
                    if (fixedServices.wheels.installedBy) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: fixedServices.wheels.installedBy,
                            workType: 'FIXED_WHEELS_INSTALL',
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
                            workType: 'BODY_PART',
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
                        workType: 'SERVICE_FILM',
                        serviceType: 'FILM',
                        amount: data.servicesData.film.amount,
                        description: 'Плёнка',
                    });
                }
                if (data.servicesData.dryCleaning?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.dryCleaning.executorId,
                        workType: 'SERVICE_DRY_CLEANING',
                        serviceType: 'DRY_CLEANING',
                        amount: data.servicesData.dryCleaning.executorAmount,
                        description: 'Химчистка',
                    });
                }
                if (data.servicesData.polishing?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.polishing.executorId,
                        workType: 'SERVICE_POLISHING',
                        serviceType: 'POLISHING',
                        amount: data.servicesData.polishing.executorAmount,
                        description: 'Полировка/Керамика',
                    });
                }
                if (data.servicesData.wheelPainting) {
                    const wp = data.servicesData.wheelPainting;
                    if (wp.mainExecutorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.mainExecutorId,
                            workType: 'SERVICE_WHEEL_PAINTING',
                            serviceType: 'WHEEL_PAINTING',
                            amount: 0, // Сумма за саму покраску если нужно
                            description: 'Покраска дисков (основная)',
                        });
                    }
                    if (wp.mounting?.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.mounting.executorId,
                            workType: 'SERVICE_WHEEL_PAINTING_MOUNTING',
                            serviceType: 'WHEEL_PAINTING',
                            amount: wp.mounting.amount || 0,
                            description: 'Покраска дисков - Монтаж/Демонтаж',
                        });
                    }
                    if (wp.caps?.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: wp.caps.executorId,
                            workType: 'SERVICE_WHEEL_PAINTING_CAPS',
                            serviceType: 'WHEEL_PAINTING',
                            amount: wp.caps.amount || 0,
                            description: 'Покраска дисков - Колпачки',
                        });
                    }
                }
                if (data.servicesData.carbon) {
                    const carbon = data.servicesData.carbon;
                    if (carbon.executorId) {
                        assignments.push({
                            workOrderId: result.id,
                            executorId: carbon.executorId,
                            workType: 'SERVICE_CARBON',
                            serviceType: 'CARBON',
                            amount: carbon.price || 0,
                            description: `Карбон - ${carbon.stage || ''} (${carbon.type || ''})`,
                            metadata: carbon,
                        });
                    }
                }
                // Существует ли бонус? Если пришел в servicesData.bonus
                if (data.servicesData.bonus?.executorId) {
                    assignments.push({
                        workOrderId: result.id,
                        executorId: data.servicesData.bonus.executorId,
                        workType: 'SERVICE_BONUS',
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
                        workType: 'ARMATURA_ADDITIONAL',
                        amount: service.amount,
                        description: service.name,
                    });
                }
            }

            // 3. Создать все назначения одним запросом
            if (assignments.length > 0) {
                await this.prisma.workOrderExecutor.createMany({
                    data: assignments,
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

    async findAll(userId: number, userRole: string, view?: string) {
        const where: any = {};

        // Role-based filtering
        if (userRole === 'MANAGER') {
            // Managers see only their own unless view='all' is requested
            if (view !== 'all') {
                where.managerId = userId;
            }
        } else if (userRole === 'MASTER') {
            where.masterId = userId;
        } else if (userRole === 'EXECUTOR') {
            where.executorId = userId;
        }
        // ADMIN sees all by default

        return this.prisma.workOrder.findMany({
            where,
            include: {
                request: true,
                manager: { select: { id: true, name: true, email: true } },
                master: { select: { id: true, name: true, email: true } },
                executor: { select: { id: true, name: true, email: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        return this.prisma.workOrder.findUnique({
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
    }

    async update(id: number, data: Partial<CreateWorkOrderDto>) {
        // Если изменяется totalAmount, пересчитываем ЗП исполнителей арматурки
        if (data.totalAmount) {
            await this.recalculateArmaturaPayments(id, data.totalAmount);
        }

        return this.prisma.workOrder.update({
            where: { id },
            data,
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
    async startWork(id: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.IN_PROGRESS,
                startedAt: new Date(),
            },
        });
    }

    async submitForReview(id: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.UNDER_REVIEW,
            },
        });
    }

    async approve(id: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.APPROVED,
            },
        });
    }

    async requestRevision(id: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.RETURNED_FOR_REVISION,
            },
        });
    }

    async complete(id: number) {
        return this.prisma.workOrder.update({
            where: { id },
            data: {
                status: WorkOrderStatus.COMPLETED,
                completedAt: new Date(),
            },
        });
    }

    // Photo management
    async addPhotoBefore(id: number, photoUrl: string) {
        const order = await this.findOne(id);
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
        const order = await this.findOne(id);
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
}
