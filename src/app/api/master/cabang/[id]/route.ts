import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json()
    try {
        const item = await prisma.masterCabang.update({
            where: { id_cabang: parseInt(params.id) },
            data: {
                cabang: body.cabang,
                alamat: body.alamat,
                id_area: body.id_area ? parseInt(body.id_area) : null
            }
        })
        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.masterCabang.delete({
            where: { id_cabang: parseInt(params.id) }
        })
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}
