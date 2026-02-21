const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function getAssets() {
    try {
        const items = await prisma.serialNumber.findMany({
            take: 1,
            include: { barang: { select: { nama_barang: true, kode_barang: true } } }
        });
        console.log("Success!", items);
    } catch (e) {
        console.error("\n--- PRISMA ERROR DUMP ---");
        console.error(e.message);
        console.error("-------------------------\n");
    } finally {
        await prisma.$disconnect();
    }
}
getAssets();
