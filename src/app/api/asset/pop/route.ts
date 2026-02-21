import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
    try {
        const pops = await prisma.serialNumber.findMany({
            where: { lokasi_pop: { not: null } },
            select: { lokasi_pop: true },
            distinct: ['lokasi_pop']
        })

        const validPops = pops.map((p: { lokasi_pop: string | null }) => p.lokasi_pop).filter(Boolean)
        return NextResponse.json(validPops)
    } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 500 })
    }
}
