import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const postsCount = await prisma.post.count();
    const allPosts = await prisma.post.findMany();

    console.log('Total posts in DB:', postsCount);
    console.log('Statuses:', allPosts.map(p => ({ id: p.id, title: p.title, status: p.status })));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
