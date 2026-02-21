'use client'
import { useEffect, useState, useCallback } from 'react'
import { ArrowUpCircle, Plus } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BarangKeluar {
    id_keluar: number; jumlah: number; tgl_keluar: string;
    keterangan: string | null; no_request: string | null;
    barang: { nama_barang: string; kode_barang: string; satuan: string | null }
}
interface BarangOption { id_barang: number; nama_barang: string; kode_barang: string }

export default function KeluarPage() {
    const [items, setItems] = useState<BarangKeluar[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [barangList, setBarangList] = useState<BarangOption[]>([])
    const [form, setForm] = useState({ id_barang: '', jumlah: '', keterangan: '', no_request: '', tgl_keluar: new Date().toISOString().split('T')[0] })
    const [saving, setSaving] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/keluar?page=${page}&limit=20`)
            if (res.ok) { const d = await res.json(); setItems(d.items); setTotal(d.total) }
        } finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchItems() }, [fetchItems])
    useEffect(() => { if (showForm) fetch('/api/inventory?limit=500').then(r => r.json()).then(d => setBarangList(d.items)) }, [showForm])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const res = await fetch('/api/keluar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, id_barang: parseInt(form.id_barang), jumlah: parseFloat(form.jumlah) }) })
            if (res.ok) { setShowForm(false); fetchItems() }
        } finally { setSaving(false) }
    }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowUpCircle size={22} color="#EF4444" /> Barang Keluar
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Riwayat pengeluaran barang · {total} transaksi</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Input Barang Keluar</button>
            </div>
            <div className="page-content">
                {showForm && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Form Pengeluaran Barang</h3>
                        <form onSubmit={handleSubmit}>
                            <div className="grid-2" style={{ marginBottom: 16, gap: 16 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Barang *</label>
                                    <select className="input" value={form.id_barang} onChange={e => setForm({ ...form, id_barang: e.target.value })} required>
                                        <option value="">-- Pilih Barang --</option>
                                        {barangList.map(b => <option key={b.id_barang} value={b.id_barang}>{b.kode_barang} - {b.nama_barang}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Jumlah *</label>
                                    <input className="input" type="number" min="1" value={form.jumlah} onChange={e => setForm({ ...form, jumlah: e.target.value })} required placeholder="0" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Tanggal Keluar</label>
                                    <input className="input" type="date" value={form.tgl_keluar} onChange={e => setForm({ ...form, tgl_keluar: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>No. Request (opsional)</label>
                                    <input className="input" value={form.no_request} onChange={e => setForm({ ...form, no_request: e.target.value })} placeholder="REQ-001" />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Keterangan</label>
                                    <textarea className="input" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Tujuan pengeluaran..." rows={2} style={{ resize: 'vertical' }} />
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : '✓ Simpan'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat...</div> : (
                        <table className="data-table">
                            <thead>
                                <tr><th>#</th><th>Barang</th><th>Jumlah</th><th>No. Request</th><th>Keterangan</th><th>Tanggal Keluar</th></tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Belum ada transaksi keluar</td></tr>
                                    : items.map((item, idx) => (
                                        <tr key={item.id_keluar}>
                                            <td style={{ color: '#475569', fontSize: 12 }}>{(page - 1) * 20 + idx + 1}</td>
                                            <td>
                                                <div style={{ color: '#F1F5F9', fontWeight: 500 }}>{item.barang.nama_barang}</div>
                                                <div style={{ fontSize: 11, color: '#60A5FA', fontFamily: 'monospace' }}>{item.barang.kode_barang}</div>
                                            </td>
                                            <td><span style={{ color: '#EF4444', fontWeight: 700, fontSize: 16 }}>-{item.jumlah}</span> <span style={{ color: '#64748B', fontSize: 12 }}>{item.barang.satuan}</span></td>
                                            <td style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{item.no_request ?? '-'}</td>
                                            <td style={{ fontSize: 12, color: '#64748B' }}>{item.keterangan ?? '-'}</td>
                                            <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_keluar)}</td>
                                        </tr>
                                    ))}
                            </tbody>
                        </table>
                    )}
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
