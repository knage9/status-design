import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WorkOrderNumberService {
    constructor(private prisma: PrismaService) { }

    async generateNumber(): Promise<string> {
        const currentYear = new Date().getFullYear();

        // Find the latest work order for this year
        const latestOrder = await this.prisma.workOrder.findFirst({
            where: {
                orderNumber: {
                    startsWith: `ЗН-${currentYear}-`,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        let nextNumber = 1;
        if (latestOrder) {
            // Extract number from ЗН-2025-001
            const parts = latestOrder.orderNumber.split('-');
            const currentNumber = parseInt(parts[2]);
            nextNumber = currentNumber + 1;
        }

        // Pad to 3 digits: ЗН-2025-001
        const paddedNumber = nextNumber.toString().padStart(3, '0');
        return `ЗН-${currentYear}-${paddedNumber}`;
    }
}
