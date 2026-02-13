import { PrismaService } from '../prisma/prisma.service';
export declare class WorkOrderNumberService {
    private prisma;
    constructor(prisma: PrismaService);
    generateNumber(): Promise<string>;
}
