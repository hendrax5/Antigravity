import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''

    const [items, total] = await Promise.all([
        prisma.masterBarang.findMany({
            where: {
                OR: [
                    { nama_barang: { contains: search } },
                    { kode_barang: { contains: search } }
                ]
            },
            include: { kategori: true },
            orderBy: { nama_barang: 'asc' },
            take: 100 // limit for safety
        }),
        prisma.masterBarang.count({
            where: {
                OR: [
                    { nama_barang: { contains: search } },
                    { kode_barang: { contains: search } }
                ]
            }
        }),
    ])
    return NextResponse.json({ items, total })
}

export async function POST(request: Request) {
    const body = await request.json()
    try {
        const item = await prisma.masterBarang.create({
            data: {
                id_perusahaan: 1, // default
                id_kategori: parseInt(body.id_kategori),
                kode_barang: body.kode_barang,
                nama_barang: body.nama_barang,
                sn: body.sn || 'tidak',
                stok_barang_baru: parseFloat(body.stok_barang_baru || 0),
                stok_dismantle: parseFloat(body.stok_dismantle || 0),
                satuan: body.satuan || 'pcs',
                harga_barang: parseFloat(body.harga_barang || 0),
                tgl_input: new Date()
            }
        })
        return NextResponse.json(item, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}
