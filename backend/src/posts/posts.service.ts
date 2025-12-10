import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.PostCreateInput) {
        return this.prisma.post.create({ data });
    }

    findAll() {
        return this.prisma.post.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { datePublished: 'desc' },
        });
    }

    findAllAdmin() {
        return this.prisma.post.findMany({
            orderBy: { id: 'desc' },
        });
    }

    findOne(id: number) {
        return this.prisma.post.findUnique({ where: { id } });
    }

    async findOneBySlug(slug: string) {
        const post = await this.prisma.post.findUnique({ where: { slug } });
        return post;
    }

    async incrementViews(slug: string) {
        const post = await this.prisma.post.findUnique({ where: { slug } });

        if (post) {
            await this.prisma.post.update({
                where: { id: post.id },
                data: { views: { increment: 1 } },
            });
            return { success: true, views: post.views + 1 };
        }

        return { success: false };
    }

    async update(id: number, data: Prisma.PostUpdateInput) {
        // If status is being changed to PUBLISHED and datePublished is not set, set it
        if (data.status === 'PUBLISHED') {
            const post = await this.prisma.post.findUnique({ where: { id } });
            if (post && !post.datePublished) {
                data.datePublished = new Date();
            }
        }

        return this.prisma.post.update({
            where: { id },
            data,
        });
    }

    remove(id: number) {
        return this.prisma.post.delete({ where: { id } });
    }
}
