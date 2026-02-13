"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let PostsService = class PostsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    create(data, userRole) {
        if (userRole === 'MANAGER') {
            if (data.status && data.status !== 'DRAFT' && data.status !== 'REVIEW') {
                throw new common_1.ForbiddenException('MANAGER can only create posts with DRAFT or REVIEW status');
            }
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
    findAllAdmin(userRole) {
        const where = {};
        if (userRole === 'MANAGER') {
            where.status = { in: ['DRAFT', 'REVIEW'] };
        }
        return this.prisma.post.findMany({
            where,
            orderBy: { id: 'desc' },
        });
    }
    findOne(id) {
        return this.prisma.post.findUnique({ where: { id } });
    }
    async findOneBySlug(slug) {
        const post = await this.prisma.post.findUnique({ where: { slug } });
        return post;
    }
    async incrementViews(slug) {
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
    async update(id, data, userRole) {
        if (userRole === 'MANAGER' && data.status) {
            const currentPost = await this.prisma.post.findUnique({ where: { id } });
            if (!currentPost) {
                throw new common_1.BadRequestException('Post not found');
            }
            if (data.status === 'PUBLISHED') {
                throw new common_1.ForbiddenException('MANAGER cannot publish posts. Only ADMIN can set status to PUBLISHED.');
            }
            if (data.status !== 'DRAFT' && data.status !== 'REVIEW') {
                throw new common_1.ForbiddenException('MANAGER can only set status to DRAFT or REVIEW');
            }
        }
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
    async updateStatus(id, status, userRole) {
        if (userRole === 'MANAGER' && status === 'PUBLISHED') {
            throw new common_1.ForbiddenException('MANAGER cannot publish posts. Only ADMIN can set status to PUBLISHED.');
        }
        if (userRole === 'MANAGER' && status !== 'DRAFT' && status !== 'REVIEW') {
            throw new common_1.ForbiddenException('MANAGER can only set status to DRAFT or REVIEW');
        }
        const data = { status: status };
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
    remove(id) {
        return this.prisma.post.delete({ where: { id } });
    }
};
exports.PostsService = PostsService;
exports.PostsService = PostsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], PostsService);
//# sourceMappingURL=posts.service.js.map