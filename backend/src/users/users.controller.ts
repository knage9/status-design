import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Post()
    @Roles('ADMIN')
    create(@Body() createUserDto: { email: string; password: string; name: string; phone?: string; role: string }) {
        return this.usersService.create(createUserDto);
    }

    @Get()
    @Roles('ADMIN')
    findAll() {
        return this.usersService.findAll();
    }

    @Get(':id')
    @Roles('ADMIN')
    findOne(@Param('id') id: string) {
        return this.usersService.findOne(+id);
    }

    @Patch(':id')
    @Roles('ADMIN')
    update(@Param('id') id: string, @Body() updateUserDto: Partial<{ email: string; name: string; phone: string; role: string; isActive: boolean }>) {
        return this.usersService.update(+id, updateUserDto);
    }

    @Patch(':id/password')
    @Roles('ADMIN')
    updatePassword(@Param('id') id: string, @Body() body: { password: string }) {
        return this.usersService.updatePassword(+id, body.password);
    }

    @Delete(':id')
    @Roles('ADMIN')
    remove(@Param('id') id: string) {
        return this.usersService.remove(+id);
    }
}
