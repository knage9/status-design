import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RequestNumberService {
    constructor(private prisma: PrismaService) { }

    /**
     * Generate unique request number in format: DD/MM-N
     * Example: 7/12-1, 7/12-2, etc.
     */
    async generateRequestNumber(): Promise<string> {
        const now = new Date();
        const day = now.getDate();
        const month = now.getMonth() + 1;

        // Get start and end of today
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Count requests created today
        const todayCount = await this.prisma.request.count({
            where: {
                createdAt: {
                    gte: startOfDay,
                    lte: endOfDay,
                },
            },
        });

        const sequenceNumber = todayCount + 1;
        return `${day}/${month}-${sequenceNumber}`;
    }
}
