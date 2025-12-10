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

            const result = await this.prisma.workOrder.create({
                data: {
                    ...data,
                    orderNumber,
                    photosBeforeWork: [],
                    photosAfterWork: [],
                },
                include: {
                    request: true,
                    manager: { select: { id: true, name: true, email: true } },
                    master: { select: { id: true, name: true, email: true } },
                    executor: { select: { id: true, name: true, email: true } },
                },
            });

            console.log('Work order created successfully:', result.id);
            return result;
        } catch (error) {
            console.error('Error creating work order:', error);

            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                console.log('Prisma error code:', error.code);
                if (error.code === 'P2003') {
                    // Foreign key constraint failed
                    throw new NotFoundException(`Request or Manager not found. Details: ${error.meta?.field_name}`);
                }
                if (error.code === 'P2002') {
                    // Unique constraint failed
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
            },
        });
    }

    async update(id: number, data: Partial<CreateWorkOrderDto>) {
        return this.prisma.workOrder.update({
            where: { id },
            data,
            include: {
                request: true,
                manager: { select: { id: true, name: true, email: true } },
                master: { select: { id: true, name: true, email: true } },
                executor: { select: { id: true, name: true, email: true } },
            },
        });
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
