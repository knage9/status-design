import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { Prisma } from '@prisma/client';

@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) { }

    @Get()
    findAll() {
        return this.reviewsService.findAll();
    }

    @Get('admin')
    findAllAdmin() {
        return this.reviewsService.findAllAdmin();
    }

    @Post('admin')
    create(@Body() createReviewDto: Prisma.ReviewCreateInput) {
        return this.reviewsService.create(createReviewDto);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.reviewsService.findOne(+id);
    }

    @Put('admin/:id')
    update(@Param('id') id: string, @Body() updateReviewDto: Prisma.ReviewUpdateInput) {
        return this.reviewsService.update(+id, updateReviewDto);
    }

    @Delete('admin/:id')
    remove(@Param('id') id: string) {
        return this.reviewsService.remove(+id);
    }
}
