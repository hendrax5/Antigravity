'use client'
import { useEffect, useState, useCallback } from 'react'
import { ArrowDownCircle, Plus, Search } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface BarangMasuk {
    id_masuk: number; jumlah: number; tgl_masuk: string;
    keterangan: string | null; no_po: string | null; id_cabang: number | null;
    barang: { nama_barang: string; kode_barang: string; satuan: string | null }
}

interface BarangOption { id_barang: number; nama_barang: string; kode_barang: string }

export default function MasukPage() {
    const [items, setItems] = useState<BarangMasuk[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [barangList, setBarangList] = useState<BarangOption[]>([])
    const [form, setForm] = useState({ id_barang: '', jumlah: '', keterangan: '', no_po: '', tgl_masuk: new Date().toISOString().split('T')[0] })
    const [serialNumbers, setSerialNumbers] = useState<string[]>([])
    const [saving, setSaving] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/masuk?page=${page}&limit=20`)
            if (res.ok) { const d = await res.json(); setItems(d.items); setTotal(d.total) }
        } finally { setLoading(false) }
    }, [page])

    const fetchBarang = async () => {
        const res = await fetch('/api/inventory?limit=500')
        if (res.ok) { const d = await res.json(); setBarangList(d.items) }
    }

    useEffect(() => { fetchItems() }, [fetchItems])
    useEffect(() => { if (showForm) fetchBarang() }, [showForm])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const res = await fetch('/api/masuk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    id_barang: parseInt(form.id_barang),
                    jumlah: parseFloat(form.jumlah),
                    serial_numbers: serialNumbers.filter(sn => sn.trim() !== '')
                }),
            })
            if (res.ok) {
                setShowForm(false);
                setForm({ id_barang: '', jumlah: '', keterangan: '', no_po: '', tgl_masuk: new Date().toISOString().split('T')[0] });
                setSerialNumbers([])
                fetchItems()
            }
        } finally { setSaving(false) }
    }

    const handleJumlahChange = (val: string) => {
        setForm({ ...form, jumlah: val })
        const num = parseInt(val) || 0
        if (num > 0 && num <= 500) {
            setSerialNumbers(prev => {
                const next = [...prev]
                if (next.length < num) {
                    while (next.length < num) next.push('')
                } else if (next.length > num) {
                    next.length = num
                }
                return next
            })
        } else {
            setSerialNumbers([])
        }
    }

    const totalPages = Math.ceil(total / 20)

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ArrowDownCircle size={22} color="#10B981" /> Barang Masuk
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Riwayat & input penerimaan barang · {total} transaksi</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={15} /> Input Barang Masuk
                </button>
            </div>

            <div className="page-content">
                {/* Form Input */}
                {showForm && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Form Penerimaan Barang</h3>
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
                                    <input className="input" type="number" min="1" max="500" value={form.jumlah} onChange={e => handleJumlahChange(e.target.value)} required placeholder="0" />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Tanggal Masuk</label>
                                    <input className="input" type="date" value={form.tgl_masuk} onChange={e => setForm({ ...form, tgl_masuk: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>No. PO (opsional)</label>
                                    <input className="input" value={form.no_po} onChange={e => setForm({ ...form, no_po: e.target.value })} placeholder="PO-2024-001" />
                                </div>
                                <div style={{ gridColumn: '1/-1' }}>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Keterangan</label>
                                    <textarea className="input" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Keterangan tambahan..." rows={2} style={{ resize: 'vertical' }} />
                                </div>
                                {serialNumbers.length > 0 && (
                                    <div style={{ gridColumn: '1/-1', marginTop: 12, paddingTop: 16, borderTop: '1px solid #1E293B' }}>
                                        <label style={{ fontSize: 13, color: '#F1F5F9', display: 'block', marginBottom: 12, fontWeight: 500 }}>
                                            Input Serial Number ({serialNumbers.length} item) *
                                        </label>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                            {serialNumbers.map((sn, idx) => (
                                                <div key={idx}>
                                                    <input
                                                        className="input"
                                                        placeholder={`SN Item #${idx + 1}`}
                                                        value={sn}
                                                        onChange={(e) => {
                                                            const next = [...serialNumbers]
                                                            next[idx] = e.target.value
                                                            setSerialNumbers(next)
                                                        }}
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : '✓ Simpan'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Table */}
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat...</div> : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Barang</th>
                                    <th>Jumlah</th>
                                    <th>No. PO</th>
                                    <th>Keterangan</th>
                                    <th>Tanggal Masuk</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                                        <ArrowDownCircle size={32} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                                        Belum ada transaksi masuk
                                    </td></tr>
                                ) : items.map((item, idx) => (
                                    <tr key={item.id_masuk}>
                                        <td style={{ color: '#475569', fontSize: 12 }}>{(page - 1) * 20 + idx + 1}</td>
                                        <td>
                                            <div style={{ color: '#F1F5F9', fontWeight: 500 }}>{item.barang.nama_barang}</div>
                                            <div style={{ fontSize: 11, color: '#60A5FA', fontFamily: 'monospace' }}>{item.barang.kode_barang}</div>
                                        </td>
                                        <td><span style={{ color: '#10B981', fontWeight: 700, fontSize: 16 }}>+{item.jumlah}</span> <span style={{ color: '#64748B', fontSize: 12 }}>{item.barang.satuan}</span></td>
                                        <td style={{ fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{item.no_po ?? '-'}</td>
                                        <td style={{ fontSize: 12, color: '#64748B', maxWidth: 200 }}>{item.keterangan ?? '-'}</td>
                                        <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_masuk)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>Halaman {page} dari {totalPages}</span>
                        <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-secondary btn-sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
                            <button className="btn btn-secondary btn-sm" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
