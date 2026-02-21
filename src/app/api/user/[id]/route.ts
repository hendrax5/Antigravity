import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    const body = await request.json()
    try {
        const item = await prisma.user.update({
            where: { id_user: parseInt(params.id) },
            data: {
                username: body.username,
                password: body.password ? body.password : undefined,
                nama: body.nama,
                telepon: body.telepon,
                level: body.level,
                jabatan: body.jabatan,
                status_aktif: body.status_aktif !== undefined ? parseInt(body.status_aktif) : undefined
            }
        })
        return NextResponse.json(item)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        await prisma.user.delete({
            where: { id_user: parseInt(params.id) }
        })
        return NextResponse.json({ success: true })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}
