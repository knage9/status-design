import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('🧹 Cleaning old Request data...');

    await prisma.request.deleteMany({});

    console.log('✅ All Request records deleted');
    console.log('\nNow run: npx prisma migrate dev');
}

main()
    .catch((e) => {
        console.error('❌ Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
