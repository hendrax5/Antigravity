import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const sn = searchParams.get('sn') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (sn) {
        where.serial_number = { contains: sn }
    }

    const [items, total] = await Promise.all([
        prisma.serialNumber.findMany({
            where, skip, take: limit,
            orderBy: { id_sn: 'desc' },
            include: { barangKeluar: { include: { barang: { select: { nama_barang: true, kode_barang: true } } } } },
        }),
        prisma.serialNumber.count({ where }),
    ])
    const itemsMapped = items.map((item: any) => ({
        ...item,
        status: item.id_status === 1 ? 'gudang' : 'deployed',
        tgl_input: item.barangKeluar?.tgl_keluar,
        barang: item.barangKeluar?.barang || { nama_barang: 'Unknown Item', kode_barang: '-' }
    }))

    return NextResponse.json({ items: itemsMapped, total })
}
