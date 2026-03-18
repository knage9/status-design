import { PrismaClient, WorkOrderStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const deliveredWithoutCompletedAt = await prisma.workOrder.findMany({
        where: {
            status: WorkOrderStatus.DELIVERED,
            completedAt: null,
        }
    });

    console.log(`Found ${deliveredWithoutCompletedAt.length} delivered orders without completedAt.`);

    for (const order of deliveredWithoutCompletedAt) {
        await prisma.workOrder.update({
            where: { id: order.id },
            data: { completedAt: order.updatedAt }
        });
        console.log(`Updated Order #${order.orderNumber} with completedAt = ${order.updatedAt}`);
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
