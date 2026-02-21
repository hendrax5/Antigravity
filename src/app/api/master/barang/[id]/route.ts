import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json()
    try {
        const item = await prisma.masterBarang.update({
            where: { id_barang: parseInt(params.id) },
            data: {
                id_kategori: body.id_kategori ? parseInt(body.id_kategori) : undefined,
                kode_barang: body.kode_barang,
                nama_barang: body.nama_barang,
                sn: body.sn,
                stok_barang_baru: body.stok_barang_baru !== undefined ? parseFloat(body.stok_barang_baru) : undefined,
                stok_dismantle: body.stok_dismantle !== undefined ? parseFloat(body.stok_dismantle) : undefined,
                satuan: body.satuan,
                harga_barang: body.harga_barang !== undefined ? parseFloat(body.harga_barang) : undefined,
            }
        })
        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.masterBarang.delete({
            where: { id_barang: parseInt(params.id) }
        })
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}
