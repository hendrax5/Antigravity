import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
        prisma.purchaseOrder.findMany({
            skip, take: limit,
            orderBy: { tgl_po: 'desc' },
            include: { details: { include: { barang: { select: { nama_barang: true, kode_barang: true } } } } },
        }),
        prisma.purchaseOrder.count(),
    ])

    return NextResponse.json({ items, total })
}
