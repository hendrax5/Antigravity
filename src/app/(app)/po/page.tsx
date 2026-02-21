'use client'
import { useEffect, useState, useCallback } from 'react'
import { ShoppingCart, Plus, CheckCircle, Search } from 'lucide-react'
import { formatDate, getStatusBadgeColor, formatRupiah } from '@/lib/utils'

interface POItem {
    id_po: number; no_po: string; status: string; keterangan: string | null; tgl_po: string; total_item: number;
    details: Array<{ id_barang: number; jumlah: number; harga: number; barang: { nama_barang: string; kode_barang: string } }>
}

export default function POPage() {
    const [items, setItems] = useState<POItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/po?page=${page}&limit=20`)
            if (res.ok) { const d = await res.json(); setItems(d.items); setTotal(d.total) }
        } finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchItems() }, [fetchItems])

    const statusLabel: Record<string, string> = { pending: 'Pending', 'di proses': 'Diproses', selesai: 'Selesai', batal: 'Dibatalkan' }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ShoppingCart size={22} color="#F59E0B" /> Purchase Order
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Daftar pesanan pembelian ke supplier · {total} PO</p>
                </div>
                <button className="btn btn-primary btn-sm"><Plus size={15} /> Buat PO Baru</button>
            </div>

            <div className="page-content">
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat...</div> :
                        <table className="data-table">
                            <thead><tr><th>No. PO</th><th>Total Item</th><th>Estimasi Nilai</th><th>Status</th><th>Tanggal PO</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Belum ada Purchase Order</td></tr>
                                    : items.map(item => {
                                        const nilaiTotal = item.details.reduce((sum, d) => sum + (d.jumlah * (d.harga || 0)), 0)
                                        return (
                                            <tr key={item.id_po}>
                                                <td style={{ fontFamily: 'monospace', fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>{item.no_po}</td>
                                                <td>
                                                    <span style={{ fontWeight: 600, color: '#F1F5F9' }}>{item.total_item || item.details.length}</span> <span style={{ color: '#64748B', fontSize: 12 }}>macam barang</span>
                                                </td>
                                                <td style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>{nilaiTotal > 0 ? formatRupiah(nilaiTotal) : '-'}</td>
                                                <td><span className={`badge ${getStatusBadgeColor(item.status)}`}>{statusLabel[item.status] ?? item.status}</span></td>
                                                <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_po)}</td>
                                                <td>
                                                    <button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }}>Detail</button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                            </tbody>
                        </table>
                    }
                </div>
                {Math.ceil(total / 20) > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>Halaman {page} dari {Math.ceil(total / 20)}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <button className="btn btn-secondary btn-sm" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
