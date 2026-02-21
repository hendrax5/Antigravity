const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function getStats() {
    try {
        await prisma.barangMasuk.count({
            where: {
                tgl_masuk: {
                    gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                },
            },
        });
        console.log("Success!");
    } catch (e) {
        require('fs').writeFileSync('err.txt', e.message);
    } finally {
        await prisma.$disconnect();
    }
}
getStats();
