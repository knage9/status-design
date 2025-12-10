import { Controller, Get, Post, Body, Patch, Param, Delete, Put } from '@nestjs/common';
import { PostsService } from './posts.service';
import { Prisma } from '@prisma/client';

@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) { }

    @Get()
    findAll() {
        return this.postsService.findAll();
    }

    @Get('admin')
    findAllAdmin() {
        return this.postsService.findAllAdmin();
    }

    @Post('admin')
    create(@Body() createPostDto: Prisma.PostCreateInput) {
        return this.postsService.create(createPostDto);
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
    findOneAdmin(@Param('id') id: string) {
        return this.postsService.findOne(+id);
    }

    @Put('admin/:id')
    update(@Param('id') id: string, @Body() updatePostDto: Prisma.PostUpdateInput) {
        return this.postsService.update(+id, updatePostDto);
    }

    @Delete('admin/:id')
    remove(@Param('id') id: string) {
        return this.postsService.remove(+id);
    }
}
