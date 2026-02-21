import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
        prisma.barangMasuk.findMany({
            skip, take: limit,
            orderBy: { tgl_masuk: 'desc' },
            include: { barang: { select: { nama_barang: true, kode_barang: true, satuan: true } } },
        }),
        prisma.barangMasuk.count(),
    ])

    return NextResponse.json({ items, total, page, limit })
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const item = await prisma.barangMasuk.create({
            data: {
                id_barang: body.id_barang,
                jumlah: body.jumlah,
                id_cabang: body.id_cabang,
                keterangan: body.keterangan,
                no_po: body.no_po,
                tgl_masuk: new Date(body.tgl_masuk ?? new Date()),
                id_admin: body.id_admin ?? 1,
            },
        })

        // Update stok
        await prisma.masterBarang.update({
            where: { id_barang: body.id_barang },
            data: { stok_barang_baru: { increment: body.jumlah } },
        })

        // Handle new SNs mapping
        if (body.serial_numbers && Array.isArray(body.serial_numbers) && body.serial_numbers.length > 0) {
            const snData = body.serial_numbers.map((sn: string) => ({
                id_barang_masuk: item.id_masuk,
                serial_number: sn,
                id_status: 1
            }))
            await prisma.serialNumber.createMany({
                data: snData
            })
        }

        return NextResponse.json(item, { status: 201 })
    } catch (e: any) {
        console.error("PRISMA API FATAL ERROR (MASUK):", e);
        return NextResponse.json({ error: e.message, stack: e.stack }, { status: 500 })
    }
}
