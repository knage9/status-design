import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Prisma } from '@prisma/client';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) { }

    @Get()
    findAll() {
        return this.portfolioService.findAll();
    }

    @Get('admin')
    findAllAdmin() {
        return this.portfolioService.findAllAdmin();
    }

    @Post('admin')
    create(@Body() createPortfolioItemDto: Prisma.PortfolioItemCreateInput) {
        return this.portfolioService.create(createPortfolioItemDto);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.portfolioService.findOneBySlug(slug);
    }

    @Get('admin/:id')
    findOneAdmin(@Param('id') id: string) {
        return this.portfolioService.findOne(+id);
    }

    @Put('admin/:id')
    update(@Param('id') id: string, @Body() updatePortfolioItemDto: Prisma.PortfolioItemUpdateInput) {
        return this.portfolioService.update(+id, updatePortfolioItemDto);
    }

    @Delete('admin/:id')
    remove(@Param('id') id: string) {
        return this.portfolioService.remove(+id);
    }
}
