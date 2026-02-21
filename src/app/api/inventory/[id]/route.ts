import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    try {
        const item = await prisma.masterBarang.findUnique({
            where: { id_barang: parseInt(id) },
            include: { kategori: true }
        })
        if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 })

        const [masuk, keluar, sn] = await Promise.all([
            prisma.barangMasuk.findMany({
                where: { id_barang: parseInt(id) },
                orderBy: { tgl_masuk: 'desc' },
                take: 50,
                include: { serialNumbers: true }
            }),
            prisma.barangKeluar.findMany({
                where: { id_barang: parseInt(id) },
                orderBy: { tgl_keluar: 'desc' },
                take: 50,
                include: { serialNumbers: true }
            }),
            prisma.serialNumber.findMany({
                where: {
                    id_status: 1,
                    OR: [
                        { barangMasuk: { id_barang: parseInt(id) } },
                        { barangKeluar: { id_barang: parseInt(id) } }
                    ]
                },
                orderBy: { id_sn: 'desc' }
            })
        ])

        return NextResponse.json({
            item,
            historyMasuk: masuk,
            historyKeluar: keluar,
            serialNumbers: sn
        })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
