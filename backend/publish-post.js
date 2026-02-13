const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const post = await prisma.post.update({
            where: { id: 1 },
            data: { status: 'PUBLISHED', datePublished: new Date() }
        });
        console.log('Post published:', post);
    } catch (err) {
        console.error('Error publishing post:', err);
    } finally {
        await prisma.$disconnect();
    }
}

main();
