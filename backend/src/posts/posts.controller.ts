import { Controller, Get, Post, Body, Patch, Param, Delete, Put, UseGuards, Request } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Prisma } from '@prisma/client';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    findAllAdmin(@Request() req) {
        return this.postsService.findAllAdmin(req.user.role);
    }

    @Post('admin')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    create(@Body() createPostDto: Prisma.PostCreateInput, @Request() req) {
        return this.postsService.create(createPostDto, req.user.role);
    }

    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.postsService.findOneBySlug(slug);
    }

    @Post(':slug/increment-views')
    incrementViews(@Param('slug') slug: string) {
        return this.postsService.incrementViews(slug);
    }

    @Get('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    findOneAdmin(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }

    @Put('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    update(@Param('id') id: string, @Body() updatePostDto: Prisma.PostUpdateInput, @Request() req) {
        return this.postsService.update(+id, updatePostDto, req.user.role);
    }

    @Patch('admin/:id/status')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN', 'MANAGER')
    updateStatus(@Param('id') id: string, @Body() body: { status: string }, @Request() req) {
        return this.postsService.updateStatus(+id, body.status, req.user.role);
    }

    @Delete('admin/:id')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.postsService.remove(+id);
    }
}
