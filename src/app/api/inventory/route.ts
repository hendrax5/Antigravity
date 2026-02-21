import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const kategori = searchParams.get('kategori') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}
    if (search) {
        where.OR = [
            { nama_barang: { contains: search } },
            { kode_barang: { contains: search } },
        ]
    }
    if (kategori) {
        where.id_kategori = parseInt(kategori)
    }

    const [items, total] = await Promise.all([
        prisma.masterBarang.findMany({
            where,
            skip,
            take: limit,
            orderBy: { nama_barang: 'asc' },
            include: { kategori: true },
        }),
        prisma.masterBarang.count({ where }),
    ])

    return NextResponse.json({ items, total, page, limit })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const item = await prisma.masterBarang.create({
        data: {
            id_perusahaan: body.id_perusahaan ?? 1,
            id_kategori: body.id_kategori,
            kode_barang: body.kode_barang,
            nama_barang: body.nama_barang,
            sn: body.sn ?? 'tidak',
            satuan: body.satuan ?? 'Pcs',
            harga_barang: body.harga_barang ?? 0,
            stok_barang_baru: body.stok_barang_baru ?? 0,
            tgl_input: new Date(body.tgl_input ?? new Date()),
        },
    })
    return NextResponse.json(item, { status: 201 })
}
