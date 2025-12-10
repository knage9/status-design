import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const admin = await prisma.user.upsert({
        where: { email: 'admin@statusdesign.ru' },
        update: {},
        create: {
            email: 'admin@statusdesign.ru',
            password: hashedPassword,
            name: 'Администратор',
            phone: '+7 (999) 123-45-67',
            role: 'ADMIN',
            isActive: true,
        },
    });

    console.log('✅ Admin user created:');
    console.log('   Email:', admin.email);
    console.log('   Password: admin123');
    console.log('   Role:', admin.role);

    // Create test users for other roles
    const managerPassword = await bcrypt.hash('manager123', 10);
    const manager = await prisma.user.upsert({
        where: { email: 'manager@statusdesign.ru' },
        update: {},
        create: {
            email: 'manager@statusdesign.ru',
            password: managerPassword,
            name: 'Менеджер Иван',
            phone: '+7 (999) 111-11-11',
            role: 'MANAGER',
            isActive: true,
        },
    });

    const masterPassword = await bcrypt.hash('master123', 10);
    const master = await prisma.user.upsert({
        where: { email: 'master@statusdesign.ru' },
        update: {},
        create: {
            email: 'master@statusdesign.ru',
            password: masterPassword,
            name: 'Мастер Петр',
            phone: '+7 (999) 222-22-22',
            role: 'MASTER',
            isActive: true,
        },
    });

    const executorPassword = await bcrypt.hash('executor123', 10);
    const executor = await prisma.user.upsert({
        where: { email: 'executor@statusdesign.ru' },
        update: {},
        create: {
            email: 'executor@statusdesign.ru',
            password: executorPassword,
            name: 'Исполнитель Сергей',
            phone: '+7 (999) 333-33-33',
            role: 'EXECUTOR',
            isActive: true,
        },
    });

    console.log('✅ Test users created:');
    console.log('   Manager:', manager.email, '/ manager123');
    console.log('   Master:', master.email, '/ master123');
    console.log('   Executor:', executor.email, '/ executor123');
    console.log('\n🎉 Seeding completed!');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
