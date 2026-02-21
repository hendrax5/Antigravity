const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] });

async function getStats() {
    try {
        const [
            totalBarang,
            totalStokBaru,
            stokMenipis,
            barangRusak,
            masukBulanIni,
            keluarBulanIni,
            recentMasuk,
            recentKeluar,
            stokPerKategori,
        ] = await Promise.all([
            prisma.masterBarang.count(),
            prisma.masterBarang.aggregate({ _sum: { stok_barang_baru: true } }),
            prisma.masterBarang.count({ where: { stok_barang_baru: { lte: 5, gt: 0 } } }),
            prisma.barangRusak.count(),
            prisma.barangMasuk.count({
                where: {
                    tgl_masuk: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.barangKeluar.count({
                where: {
                    tgl_keluar: {
                        gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
                    },
                },
            }),
            prisma.barangMasuk.findMany({
                take: 5,
                orderBy: { tgl_masuk: 'desc' },
                include: { barang: { select: { nama_barang: true, kode_barang: true } } },
            }),
            prisma.barangKeluar.findMany({
                take: 5,
                orderBy: { tgl_keluar: 'desc' },
                include: { barang: { select: { nama_barang: true, kode_barang: true } } },
            }),
            prisma.masterKategori.findMany({
                select: {
                    id_kategori: true,
                    kategori: true,
                    _count: { select: { barang: true } },
                    barang: {
                        select: { stok_barang_baru: true },
                    },
                },
            }),
        ]);
        console.log("Success!", { totalBarang, totalStok: totalStokBaru._sum.stok_barang_baru });
    } catch (e) {
        console.error("\n--- PRISMA ERROR DUMP ---");
        console.error(e.message);
        console.error("-------------------------\n");
    } finally {
        await prisma.$disconnect();
    }
}
getStats();
