import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PortfolioService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.PortfolioItemCreateInput) {
        return this.prisma.portfolioItem.create({ data });
    }

    findAll() {
        return this.prisma.portfolioItem.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { date: 'desc' },
        });
    }

    findAllAdmin() {
        return this.prisma.portfolioItem.findMany({
            orderBy: { date: 'desc' },
        });
    }

    findOne(id: number) {
        return this.prisma.portfolioItem.findUnique({ where: { id } });
    }

    async findOneBySlug(slug: string) {
        const item = await this.prisma.portfolioItem.findUnique({ where: { slug } });

        // Increment views
        if (item) {
            await this.prisma.portfolioItem.update({
                where: { id: item.id },
                data: { views: { increment: 1 } },
            });
        }

        return item;
    }

    update(id: number, data: Prisma.PortfolioItemUpdateInput) {
        return this.prisma.portfolioItem.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.portfolioItem.delete({ where: { id } });
    }
}
