import { PrismaService } from '../prisma/prisma.service';
export declare class RequestNumberService {
    private prisma;
    constructor(prisma: PrismaService);
    generateRequestNumber(): Promise<string>;
}
