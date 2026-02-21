import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
        prisma.barangKeluar.findMany({
            skip, take: limit,
            orderBy: { tgl_keluar: 'desc' },
            include: { barang: { select: { nama_barang: true, kode_barang: true, satuan: true } } },
        }),
        prisma.barangKeluar.count(),
    ])

    return NextResponse.json({ items, total, page, limit })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const item = await prisma.barangKeluar.create({
        data: {
            id_barang: body.id_barang,
            jumlah: body.jumlah,
            id_cabang: body.id_cabang,
            keterangan: body.keterangan,
            no_request: body.no_request,
            tgl_keluar: new Date(body.tgl_keluar ?? new Date()),
            id_admin: body.id_admin ?? 1,
        },
    })

    // Decrement stok
    await prisma.masterBarang.update({
        where: { id_barang: body.id_barang },
        data: { stok_barang_baru: { decrement: body.jumlah } },
    })

    return NextResponse.json(item, { status: 201 })
}
