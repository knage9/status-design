import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    findAll() {
        return this.reviewsService.findAll();
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAllAdmin() {
        return this.reviewsService.findAllAdmin();
    }

    // Публичное создание отзыва с сайта (без авторизации)
    @Post()
    createPublic(@Body() createReviewDto: Prisma.ReviewCreateInput) {
        return this.reviewsService.create(createReviewDto);
    }

    @Post('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() createReviewDto: Prisma.ReviewCreateInput) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reviewsService.findOne(+id);
    }

    @Put('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() updateReviewDto: Prisma.ReviewUpdateInput) {
        return this.reviewsService.update(+id, updateReviewDto);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(+id);
    }
}
