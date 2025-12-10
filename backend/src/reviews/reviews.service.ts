import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewsService {
    constructor(private prisma: PrismaService) { }

    private generateTags(data: Prisma.ReviewCreateInput | Prisma.ReviewUpdateInput): string[] {
        const tags: string[] = [];

        // Tag 1: Car Brand + Model
        if (data.carBrand && data.carModel) {
            tags.push(`${data.carBrand} ${data.carModel}`);
        }

        // Tag 2+: Translated Services
        const serviceMap: Record<string, string> = {
            'antichrome': 'Антихром',
            'soundproofing': 'Шумоизоляция',
            'ceramic': 'Керамика',
            'polish': 'Полировка',
            'carbon': 'Карбон',
            'antigravity-film': 'Антигравийная пленка',
            'disk-painting': 'Колесные диски',
            'cleaning': 'Химчистка'
        };

        if (Array.isArray(data.servicesSelected)) {
            data.servicesSelected.forEach((serviceKey: string) => {
                if (serviceMap[serviceKey]) {
                    tags.push(serviceMap[serviceKey]);
                }
            });
        }

        return tags;
    }

    create(data: Prisma.ReviewCreateInput) {
        // Auto-generate tags if not provided
        if (!data.tags || (Array.isArray(data.tags) && data.tags.length === 0)) {
            data.tags = this.generateTags(data);
        }

        // Auto-set main service from selected services
        if (!data.service && Array.isArray(data.servicesSelected) && data.servicesSelected.length > 0) {
            data.service = data.servicesSelected[0];
        } else if (!data.service) {
            data.service = 'other'; // Fallback
        }

        return this.prisma.review.create({ data });
    }

    findAll() {
        return this.prisma.review.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { dateCreated: 'desc' },
        });
    }

    findAllAdmin() {
        return this.prisma.review.findMany({
            orderBy: { dateCreated: 'desc' },
        });
    }

    findOne(id: number) {
        return this.prisma.review.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.ReviewUpdateInput) {
        // If status is being changed to PUBLISHED and datePublished is not set, set it
        if (data.status === 'PUBLISHED') {
            const review = await this.prisma.review.findUnique({ where: { id } });
            if (review && !review.datePublished) {
                data.datePublished = new Date();
            }
        }

        // Auto-set main service if servicesSelected is updated
        if (data.servicesSelected && Array.isArray(data.servicesSelected) && data.servicesSelected.length > 0) {
            data.service = data.servicesSelected[0];
        }

        // Regenerate tags ONLY if not explicitly provided in update data
        if (data.tags === undefined) {
            if (data.carBrand || data.carModel || data.servicesSelected) {
                const existing = await this.prisma.review.findUnique({ where: { id } });
                if (existing) {
                    const mergedData = { ...existing, ...data } as any;
                    data.tags = this.generateTags(mergedData);
                }
            }
        }

        return this.prisma.review.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.review.delete({ where: { id } });
    }
}
