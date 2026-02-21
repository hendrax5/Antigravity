const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['error'] });

async function testAll() {
    console.log("Testing Prisma Models...");
    const models = [
        { name: 'MasterBarang', func: () => prisma.masterBarang.findFirst() },
        { name: 'Asset (SerialNumber)', func: () => prisma.serialNumber.findFirst({ include: { barangKeluar: { include: { barang: true } } } }) },
        { name: 'Kategori', func: () => prisma.masterKategori.findFirst() },
        { name: 'Cabang', func: () => prisma.masterCabang.findFirst() },
        { name: 'Area', func: () => prisma.masterArea.findFirst() },
        { name: 'User', func: () => prisma.user.findFirst() }
    ];

    for (const model of models) {
        try {
            await model.func();
            console.log(`[OK] ${model.name}`);
        } catch (e) {
            console.log(`[ERROR] ${model.name}:`, e.message.split('\n').pop() || e.message);
        }
    }
    await prisma.$disconnect();
}
testAll();
