const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

async function getAssets() {
    try {
        const items = await prisma.serialNumber.findMany({
            take: 1
        });
        console.log("Success!", items);
    } catch (e) {
        console.log("ERROR_MESSAGE:" + e.message);
    } finally {
        await prisma.$disconnect();
    }
}
getAssets();
