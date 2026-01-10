import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('portfolio')
export class PortfolioController {
    constructor(private readonly portfolioService: PortfolioService) { }

    @Get()
    findAll() {
        return this.portfolioService.findAll();
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findAllAdmin() {
        return this.portfolioService.findAllAdmin();
    }

    @Post('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    create(@Body() createPortfolioItemDto: Prisma.PortfolioItemCreateInput) {
        return this.portfolioService.create(createPortfolioItemDto);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.portfolioService.findOneBySlug(slug);
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    findOneAdmin(@Param('id') id: string) {
        return this.portfolioService.findOne(+id);
    }

    @Put('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() updatePortfolioItemDto: Prisma.PortfolioItemUpdateInput) {
        return this.portfolioService.update(+id, updatePortfolioItemDto);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.portfolioService.remove(+id);
    }
}
