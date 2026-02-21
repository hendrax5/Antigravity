import { prisma } from '@/lib/db'

export default async function PrintPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | undefined }> }) {
    const params = await searchParams
    const type = params.type || 'inventory'
    const startDate = params.start || '2000-01-01'
    const endDate = params.end || '2100-01-01'

    let title = ""
    let period = ""
    let columns: string[] = []
    let data: any[] = []

    if (type === 'inventory') {
        title = "Laporan Stok Gudang (Inventory)"
        period = `Per Tanggal: ${new Date().toLocaleDateString('id-ID')}`
        columns = ["No", "Kode", "Nama Barang", "Kategori", "Satuan", "Stok", "Harga"]

        const res = await prisma.masterBarang.findMany({
            include: { kategori: true },
            orderBy: { nama_barang: 'asc' }
        })

        data = res.map((item, idx) => [
            idx + 1,
            item.kode_barang,
            item.nama_barang,
            item.kategori?.kategori || '-',
            item.satuan || '-',
            // @ts-ignore
            item.stok_barang_baru || 0,
            // @ts-ignore
            `Rp ${(item.harga_barang || 0).toLocaleString('id-ID')}`
        ])
    }
    else if (type === 'masuk') {
        title = "Laporan Barang Masuk"
        period = `Periode: ${startDate} s/d ${endDate}`
        columns = ["No", "Tanggal", "Kode", "Nama Barang", "Jumlah", "No PO", "Keterangan"]

        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        const res = await prisma.barangMasuk.findMany({
            where: { tgl_masuk: { gte: new Date(startDate), lte: end } },
            include: { barang: true },
            orderBy: { tgl_masuk: 'desc' }
        })

        data = res.map((item, idx) => [
            idx + 1,
            // @ts-ignore
            new Date(item.tgl_masuk).toLocaleDateString('id-ID'),
            item.barang?.kode_barang || '-',
            item.barang?.nama_barang || '-',
            // @ts-ignore
            item.jumlah || 0,
            item.no_po || '-',
            item.keterangan || '-'
        ])
    }
    else if (type === 'keluar') {
        title = "Laporan Barang Keluar"
        period = `Periode: ${startDate} s/d ${endDate}`
        columns = ["No", "Tanggal", "Kode", "Nama Barang", "Jumlah", "No Req", "Keterangan"]

        const end = new Date(endDate)
        end.setHours(23, 59, 59, 999)

        const res = await prisma.barangKeluar.findMany({
            where: { tgl_keluar: { gte: new Date(startDate), lte: end } },
            include: { barang: true },
            orderBy: { tgl_keluar: 'desc' }
        })

        data = res.map((item, idx) => [
            idx + 1,
            // @ts-ignore
            new Date(item.tgl_keluar).toLocaleDateString('id-ID'),
            item.barang?.kode_barang || '-',
            item.barang?.nama_barang || '-',
            // @ts-ignore
            item.jumlah || 0,
            // @ts-ignore
            item.no_request || '-',
            item.keterangan || '-'
        ])
    }

    return (
        <div style={{ padding: 40, background: 'white', color: 'black', minHeight: '100vh', fontFamily: 'sans-serif' }}>
            {/* Auto Print Script */}
            <script dangerouslySetInnerHTML={{ __html: `window.onload = function() { window.print(); }` }} />

            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    @page { margin: 1.5cm; size: A4 portrait; }
                    body { margin: 0; background: white; -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    /* Hide Sidebar & Header of the main app if this page accidentally inherits layout */
                    .sidebar { display: none !important; }
                    .topbar { display: none !important; }
                    main.content { padding: 0 !important; margin: 0 !important; max-width: 100% !important; }
                }
                .print-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
                .print-table th, .print-table td { border: 1px solid #000; padding: 8px; text-align: left; }
                .print-table th { background-color: #f3f4f6 !important; font-weight: bold; }
                .header-container { text-align: center; margin-bottom: 30px; border-bottom: 2px solid black; padding-bottom: 15px; }
                .print-btn { padding: 8px 16px; background: #3B82F6; color: white; border: none; border-radius: 6px; cursor: pointer; float: right; }
            `}} />

            <div className="no-print" style={{ marginBottom: 20, overflow: 'hidden' }}>
                <button className="print-btn" onClick={() => {/* Will be handled by raw script too if needed but auto-prints anyway */ }}>
                    🖨️ Print Laporan
                </button>
                <div style={{ color: '#666', fontSize: 13 }}>Gunakan Ctrl+P atau Command+P untuk mencetak halaman ini secara manual.</div>
            </div>

            <div className="header-container">
                <h1 style={{ margin: '0 0 5px 0', fontSize: 24, textTransform: 'uppercase' }}>WAREHOUSE MANAGEMENT SYSTEM</h1>
                <h2 style={{ margin: '0 0 10px 0', fontSize: 18 }}>{title}</h2>
                <div style={{ fontSize: 14 }}>{period}</div>
            </div>

            <table className="print-table">
                <thead>
                    <tr>
                        {columns.map((col, idx) => (
                            <th key={idx}>{col}</th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {data.length > 0 ? (
                        data.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                                {row.map((cell: any, cellIdx: number) => (
                                    <td key={cellIdx}>{cell}</td>
                                ))}
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={columns.length} style={{ textAlign: 'center', padding: 20 }}>Tidak ada data pada periode ini</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <div style={{ marginTop: 50, display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                <div style={{ textAlign: 'center' }}>
                    <div>Mengetahui,</div>
                    <div style={{ marginTop: 60, borderBottom: '1px solid black', width: 150 }}></div>
                    <div style={{ marginTop: 5 }}>Kepala Gudang</div>
                </div>
                <div style={{ textAlign: 'center' }}>
                    <div>Dicetak pada {new Date().toLocaleDateString('id-ID')}</div>
                    <div style={{ marginTop: 60, borderBottom: '1px solid black', width: 150 }}></div>
                    <div style={{ marginTop: 5 }}>Admin WMS</div>
                </div>
            </div>
        </div>
    )
}
