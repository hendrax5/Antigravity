import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    const [items, total] = await Promise.all([
        prisma.masterKategori.findMany({
            orderBy: { kategori: 'asc' },
            include: { _count: { select: { barang: true } } }
        }),
        prisma.masterKategori.count(),
    ])
    return NextResponse.json({ items, total })
}

export async function POST(request: Request) {
    const body = await request.json()
    const item = await prisma.masterKategori.create({ data: { kategori: body.kategori, kode: body.kode } })
    return NextResponse.json(item, { status: 201 })
}
