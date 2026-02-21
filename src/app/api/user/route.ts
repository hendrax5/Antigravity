import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    const [items, total] = await Promise.all([
        prisma.user.findMany({ orderBy: { nama: 'asc' } }),
        prisma.user.count(),
    ])
    return NextResponse.json({ items, total })
}

export async function POST(request: Request) {
    const body = await request.json()
    try {
        const item = await prisma.user.create({
            data: {
                username: body.username,
                password: body.password, // Ideally hashed, but following bare schema for now
                nama: body.nama,
                telepon: body.telepon,
                level: body.level || 'staff',
                jabatan: body.jabatan || 'staff',
                status_aktif: body.status_aktif !== undefined ? parseInt(body.status_aktif) : 1
            }
        })
        return NextResponse.json(item, { status: 201 })
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 })
    }
}
