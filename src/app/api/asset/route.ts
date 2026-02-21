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
            orderBy: { tgl_input: 'desc' },
            include: { barang: { select: { nama_barang: true, kode_barang: true } } },
        }),
        prisma.serialNumber.count({ where }),
    ])

    return NextResponse.json({ items, total })
}
