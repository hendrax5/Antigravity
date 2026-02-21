import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
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
        ])

        const stokKategori = stokPerKategori.map((k) => ({
            kategori: k.kategori,
            jumlahItem: k._count.barang,
            totalStok: k.barang.reduce((sum, b) => sum + (b.stok_barang_baru ?? 0), 0),
        }))

        return NextResponse.json({
            totalBarang,
            totalStok: totalStokBaru._sum.stok_barang_baru ?? 0,
            stokMenipis,
            barangRusak,
            masukBulanIni,
            keluarBulanIni,
            recentMasuk,
            recentKeluar,
            stokKategori,
        })
    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 })
    }
}
