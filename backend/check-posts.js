const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const postsCount = await prisma.post.count();
        const allPosts = await prisma.post.findMany();

        console.log('Total posts in DB:', postsCount);
        console.log('Statuses:', allPosts.map(p => ({ id: p.id, title: p.title, status: p.status })));
    } catch (err) {
        console.error('Error querying DB:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
