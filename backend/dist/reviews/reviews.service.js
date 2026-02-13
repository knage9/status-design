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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let ReviewsService = class ReviewsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    generateTags(data) {
        const tags = [];
        if (data.carBrand && data.carModel) {
            tags.push(`${data.carBrand} ${data.carModel}`);
        }
        const serviceMap = {
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
            data.servicesSelected.forEach((serviceKey) => {
                if (serviceMap[serviceKey]) {
                    tags.push(serviceMap[serviceKey]);
                }
            });
        }
        return tags;
    }
    create(data) {
        if (!data.tags || (Array.isArray(data.tags) && data.tags.length === 0)) {
            data.tags = this.generateTags(data);
        }
        if (!data.service && Array.isArray(data.servicesSelected) && data.servicesSelected.length > 0) {
            data.service = data.servicesSelected[0];
        }
        else if (!data.service) {
            data.service = 'other';
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
    findOne(id) {
        return this.prisma.review.findUnique({ where: { id } });
    }
    async update(id, data) {
        if (data.status === 'PUBLISHED') {
            const review = await this.prisma.review.findUnique({ where: { id } });
            if (review && !review.datePublished) {
                data.datePublished = new Date();
            }
        }
        if (data.servicesSelected && Array.isArray(data.servicesSelected) && data.servicesSelected.length > 0) {
            data.service = data.servicesSelected[0];
        }
        if (data.tags === undefined) {
            if (data.carBrand || data.carModel || data.servicesSelected) {
                const existing = await this.prisma.review.findUnique({ where: { id } });
                if (existing) {
                    const mergedData = { ...existing, ...data };
                    data.tags = this.generateTags(mergedData);
                }
            }
        }
        return this.prisma.review.update({
            where: { id },
            data,
        });
    }
    remove(id) {
        return this.prisma.review.delete({ where: { id } });
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map