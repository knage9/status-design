const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();

async function main() {
    try {
        const sql = fs.readFileSync('update-enum.sql', 'utf8');
        // Split by semicolon and execute each statement
        const statements = sql.split(';').map(s => s.trim()).filter(s => s.length > 0);
        for (const stmt of statements) {
            console.log('Executing:', stmt.substring(0, 50) + '...');
            await prisma.$executeRawUnsafe(stmt);
        }
        console.log('SQL successful!');
    } catch (e) {
        console.error('SQL Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
