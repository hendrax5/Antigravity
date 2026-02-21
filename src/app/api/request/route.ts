import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const [items, total] = await Promise.all([
        prisma.request.findMany({
            skip, take: limit,
            orderBy: { tgl_request: 'desc' },
            include: { details: { include: { barang: { select: { nama_barang: true } } } } },
        }),
        prisma.request.count(),
    ])

    return NextResponse.json({ items, total })
}

export async function POST(request: NextRequest) {
    const body = await request.json()
    const noRequest = `REQ-${Date.now()}`
    const item = await prisma.request.create({
        data: {
            no_request: noRequest,
            id_cabang: body.id_cabang,
            status: 'diajukan',
            keterangan: body.keterangan,
            id_admin: body.id_admin ?? 1,
            details: {
                create: body.details.map((d: { id_barang: number; jumlah: number; keterangan?: string }) => ({
                    id_barang: d.id_barang,
                    jumlah: d.jumlah,
                    keterangan: d.keterangan,
                })),
            },
        },
        include: { details: true },
    })
    return NextResponse.json(item, { status: 201 })
}
