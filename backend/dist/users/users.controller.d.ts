import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: {
        email: string;
        password: string;
        name: string;
        phone?: string;
        role: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    findAll(req: any, role?: string): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findExecutors(): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }[]>;
    findOne(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
    }>;
    update(id: string, updateUserDto: Partial<{
        email: string;
        name: string;
        phone: string;
        role: string;
        isActive: boolean;
    }>): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
    }>;
    updatePassword(id: string, body: {
        password: string;
    }): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<{
        id: number;
        name: string;
        email: string;
        password: string;
        phone: string | null;
        role: import(".prisma/client").$Enums.UserRole;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
