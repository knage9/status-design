import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Request } from '@nestjs/common';
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
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    findAll(@Request() req, @Query('role') role?: string) {
        const userRole = req.user?.role;
        
        // Если указана конкретная роль, фильтруем
        if (role === 'executor' || role === 'EXECUTOR' || role === 'PAINTER') {
            return this.usersService.findExecutors();
        }
        
        // ADMIN и MANAGER могут получить всех пользователей (для назначения мастеров и т.д.)
        if (userRole === 'ADMIN' || userRole === 'MANAGER') {
            return this.usersService.findAll();
        }
        
        // MASTER получает только исполнителей
        if (userRole === 'MASTER') {
            return this.usersService.findExecutors();
        }
        
        // По умолчанию для других ролей возвращаем исполнителей
        return this.usersService.findExecutors();
    }

    @Get('executors')
    @Roles('ADMIN', 'MANAGER', 'MASTER')
    findExecutors() {
        return this.usersService.findExecutors();
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
