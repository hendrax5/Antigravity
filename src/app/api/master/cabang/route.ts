import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    const [items, total] = await Promise.all([
        prisma.masterCabang.findMany({ orderBy: { cabang: 'asc' } }),
        prisma.masterCabang.count(),
    ])
    return NextResponse.json({ items, total })
}

export async function POST(request: Request) {
    const body = await request.json()
    const item = await prisma.masterCabang.create({
        data: { cabang: body.cabang, kode_cabang: body.kode_cabang, alamat: body.alamat, id_area: body.id_area }
    })
    return NextResponse.json(item, { status: 201 })
}
