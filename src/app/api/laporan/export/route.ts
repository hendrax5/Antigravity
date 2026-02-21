import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

function escapeCsv(str: any) {
    if (str === null || str === undefined) return '""'
    const s = String(str).replace(/"/g, '""')
    return `"${s}"`
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'inventory'
    const startDate = searchParams.get('start') || '2000-01-01'
    const endDate = searchParams.get('end') || '2100-01-01'

    let csvContent = ""
    let filename = `laporan_${type}_${new Date().getTime()}.csv`

    try {
        if (type === 'inventory') {
            const data = await prisma.masterBarang.findMany({
                include: { kategori: true }
            })
            csvContent += "ID Barang,Kode,Nama Barang,Kategori,Satuan,Stok Baru,Stok Dismantle,Harga,Ada SN\n"
            data.forEach((item: any) => {
                csvContent += `${item.id_barang},${escapeCsv(item.kode_barang)},${escapeCsv(item.nama_barang)},${escapeCsv(item.kategori?.kategori)},${escapeCsv(item.satuan)},${item.stok_barang_baru},${item.stok_dismantle},${item.harga_barang},${escapeCsv(item.sn)}\n`
            })
        }
        else if (type === 'masuk') {
            // Need to set end of day for endDate
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const data = await prisma.barangMasuk.findMany({
                where: {
                    tgl_masuk: { gte: new Date(startDate), lte: end }
                },
                include: { barang: true },
                orderBy: { tgl_masuk: 'desc' }
            })
            csvContent += "ID Masuk,Tanggal,Kode Barang,Nama Barang,Jumlah Masuk,No PO,Keterangan\n"
            data.forEach((item: any) => {
                const date = new Date(item.tgl_masuk).toISOString().split('T')[0]
                csvContent += `${item.id_masuk},${date},${escapeCsv(item.barang?.kode_barang)},${escapeCsv(item.barang?.nama_barang)},${item.jumlah},${escapeCsv(item.no_po)},${escapeCsv(item.keterangan)}\n`
            })
        }
        else if (type === 'keluar') {
            const end = new Date(endDate)
            end.setHours(23, 59, 59, 999)

            const data = await prisma.barangKeluar.findMany({
                where: {
                    tgl_keluar: { gte: new Date(startDate), lte: end }
                },
                include: { barang: true },
                orderBy: { tgl_keluar: 'desc' }
            })
            csvContent += "ID Keluar,Tanggal,Kode Barang,Nama Barang,Jumlah Keluar,No Request,Keterangan\n"
            data.forEach((item: any) => {
                const date = new Date(item.tgl_keluar).toISOString().split('T')[0]
                csvContent += `${item.id_keluar},${date},${escapeCsv(item.barang?.kode_barang)},${escapeCsv(item.barang?.nama_barang)},${item.jumlah},${escapeCsv(item.no_request)},${escapeCsv(item.keterangan)}\n`
            })
        }

        return new NextResponse(csvContent, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${filename}"`
            }
        })

    } catch (e: any) {
        return new NextResponse("Error generating CSV: " + e.message, { status: 500 })
    }
}
