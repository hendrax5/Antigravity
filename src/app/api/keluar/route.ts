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
    const tgl = new Date(body.tgl_keluar ?? new Date())
    const results = []

    // Ensure it supports `items` array from the new cart UI
    const itemsList = body.items || [{
        id_barang: body.id_barang,
        jumlah: body.jumlah,
        serial_numbers: body.serial_numbers || []
    }]

    for (const data of itemsList) {
        const item = await prisma.barangKeluar.create({
            data: {
                id_barang: data.id_barang,
                jumlah: data.jumlah,
                id_cabang: body.id_cabang || null,
                keterangan: body.keterangan || null,
                no_request: body.no_request || null,
                tgl_keluar: tgl,
                id_admin: body.id_admin ?? 1,
            },
        })

        // Decrement stok
        await prisma.masterBarang.update({
            where: { id_barang: data.id_barang },
            data: { stok_barang_baru: { decrement: data.jumlah } },
        })

        // Handle deployed SNs and POP Locations
        if (data.serial_numbers && Array.isArray(data.serial_numbers) && data.serial_numbers.length > 0) {
            await prisma.serialNumber.updateMany({
                where: { serial_number: { in: data.serial_numbers }, id_status: 1 },
                data: {
                    id_barang_keluar: item.id_keluar,
                    id_status: 2,
                    lokasi_pop: body.is_pop ? (body.lokasi_pop || 'unset') : null
                }
            })
        }

        results.push(item)
    }

    return NextResponse.json(results, { status: 201 })
}
