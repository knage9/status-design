import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class PostsService {
    constructor(private prisma: PrismaService) { }

    create(data: Prisma.PostCreateInput, userRole: string) {
        // MANAGER can only create posts with DRAFT or REVIEW status
        if (userRole === 'MANAGER') {
            if (data.status && data.status !== 'DRAFT' && data.status !== 'REVIEW') {
                throw new ForbiddenException('MANAGER can only create posts with DRAFT or REVIEW status');
            }
            // Default to DRAFT if status not provided
            if (!data.status) {
                data.status = 'DRAFT';
            }
        }
        
        return this.prisma.post.create({ data });
    }

    findAll() {
        return this.prisma.post.findMany({
            where: { status: 'PUBLISHED' },
            orderBy: { datePublished: 'desc' },
        });
    }

    findAllAdmin(userRole: string) {
        // ADMIN sees all posts, MANAGER sees only DRAFT and REVIEW
        const where: any = {};
        if (userRole === 'MANAGER') {
            where.status = { in: ['DRAFT', 'REVIEW'] };
        }
        
        return this.prisma.post.findMany({
            where,
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

    async update(id: number, data: Prisma.PostUpdateInput, userRole: string) {
        // Check status restrictions for MANAGER
        if (userRole === 'MANAGER' && data.status) {
            const currentPost = await this.prisma.post.findUnique({ where: { id } });
            if (!currentPost) {
                throw new BadRequestException('Post not found');
            }

            // MANAGER cannot set PUBLISHED status
            if (data.status === 'PUBLISHED') {
                throw new ForbiddenException('MANAGER cannot publish posts. Only ADMIN can set status to PUBLISHED.');
            }

            // MANAGER can only switch between DRAFT and REVIEW
            if (data.status !== 'DRAFT' && data.status !== 'REVIEW') {
                throw new ForbiddenException('MANAGER can only set status to DRAFT or REVIEW');
            }
        }

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

    async updateStatus(id: number, status: string, userRole: string) {
        if (userRole === 'MANAGER' && status === 'PUBLISHED') {
            throw new ForbiddenException('MANAGER cannot publish posts. Only ADMIN can set status to PUBLISHED.');
        }

        if (userRole === 'MANAGER' && status !== 'DRAFT' && status !== 'REVIEW') {
            throw new ForbiddenException('MANAGER can only set status to DRAFT or REVIEW');
        }

        const data: Prisma.PostUpdateInput = { status: status as any };
        
        // If status is being changed to PUBLISHED and datePublished is not set, set it
        if (status === 'PUBLISHED') {
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
