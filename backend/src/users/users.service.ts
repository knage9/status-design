import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: { email: string; password: string; name: string; phone?: string; role: string }) {
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new ConflictException('User with this email already exists');
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        return this.prisma.user.create({
            data: {
                ...data,
                password: hashedPassword,
                role: data.role as any,
            },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });
    }

    async findAll() {
        return this.prisma.user.findMany({
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async findOne(id: number) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
                createdAt: true,
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async findByEmail(email: string) {
        return this.prisma.user.findUnique({ where: { email } });
    }

    async update(id: number, data: Partial<{ email: string; name: string; phone: string; role: string; isActive: boolean }>) {
        return this.prisma.user.update({
            where: { id },
            data: data as any,
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                isActive: true,
            },
        });
    }

    async updatePassword(id: number, newPassword: string) {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        return this.prisma.user.update({
            where: { id },
            data: { password: hashedPassword },
        });
    }

    async remove(id: number) {
        return this.prisma.user.delete({ where: { id } });
    }
}
