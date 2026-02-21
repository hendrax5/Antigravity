'use client'
import { useEffect, useState, useCallback } from 'react'
import { ClipboardList, Plus, Trash2 } from 'lucide-react'
import { formatDate, getStatusBadgeColor } from '@/lib/utils'

interface RequestItem {
    id_request: number; no_request: string; status: string; keterangan: string | null; tgl_request: string;
    details: Array<{ id_barang: number; jumlah: number; barang: { nama_barang: string } }>
}
interface BarangOption { id_barang: number; nama_barang: string; kode_barang: string }

export default function RequestPage() {
    const [items, setItems] = useState<RequestItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [barangList, setBarangList] = useState<BarangOption[]>([])
    const [form, setForm] = useState({ keterangan: '', id_cabang: '' })
    const [details, setDetails] = useState([{ id_barang: '', jumlah: '', keterangan: '' }])
    const [saving, setSaving] = useState(false)

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/request?page=${page}&limit=20`)
            if (res.ok) { const d = await res.json(); setItems(d.items); setTotal(d.total) }
        } finally { setLoading(false) }
    }, [page])

    useEffect(() => { fetchItems() }, [fetchItems])
    useEffect(() => { if (showForm) fetch('/api/inventory?limit=500').then(r => r.json()).then(d => setBarangList(d.items)) }, [showForm])

    const addDetailRow = () => setDetails([...details, { id_barang: '', jumlah: '', keterangan: '' }])
    const removeDetailRow = (i: number) => setDetails(details.filter((_, idx) => idx !== i))
    const updateDetail = (i: number, field: string, val: string) => setDetails(details.map((d, idx) => idx === i ? { ...d, [field]: val } : d))

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault(); setSaving(true)
        try {
            const res = await fetch('/api/request', {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, details: details.map(d => ({ id_barang: parseInt(d.id_barang), jumlah: parseFloat(d.jumlah), keterangan: d.keterangan })) })
            })
            if (res.ok) { setShowForm(false); setDetails([{ id_barang: '', jumlah: '', keterangan: '' }]); fetchItems() }
        } finally { setSaving(false) }
    }

    const statusLabel: Record<string, string> = { draft: 'Draft', diajukan: 'Diajukan', disetujui: 'Disetujui', ditolak: 'Ditolak', selesai: 'Selesai' }

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ClipboardList size={22} color="#3B82F6" /> Request Barang
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Permintaan barang dari cabang · {total} request</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Buat Request</button>
            </div>
            <div className="page-content">
                {showForm && (
                    <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Form Permintaan Barang</h3>
                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: 16 }}>
                                <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Keterangan / Alasan</label>
                                <textarea className="input" value={form.keterangan} onChange={e => setForm({ ...form, keterangan: e.target.value })} placeholder="Alasan permintaan barang..." rows={2} style={{ resize: 'vertical' }} />
                            </div>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                                    <label style={{ fontSize: 12, color: '#94A3B8', fontWeight: 600 }}>DAFTAR BARANG</label>
                                    <button type="button" className="btn btn-secondary btn-sm" onClick={addDetailRow}><Plus size={12} /> Tambah Baris</button>
                                </div>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                    {details.map((d, i) => (
                                        <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 2fr auto', gap: 8, alignItems: 'center' }}>
                                            <select className="input" value={d.id_barang} onChange={e => updateDetail(i, 'id_barang', e.target.value)} required>
                                                <option value="">-- Pilih Barang --</option>
                                                {barangList.map(b => <option key={b.id_barang} value={b.id_barang}>{b.kode_barang} - {b.nama_barang}</option>)}
                                            </select>
                                            <input className="input" type="number" min="1" placeholder="Jumlah" value={d.jumlah} onChange={e => updateDetail(i, 'jumlah', e.target.value)} required />
                                            <input className="input" placeholder="Keterangan (opsional)" value={d.keterangan} onChange={e => updateDetail(i, 'keterangan', e.target.value)} />
                                            <button type="button" className="btn btn-danger btn-sm" onClick={() => removeDetailRow(i)} disabled={details.length === 1}><Trash2 size={12} /></button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: 12 }}>
                                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Menyimpan...' : '✓ Ajukan Request'}</button>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat...</div> :
                        <table className="data-table">
                            <thead><tr><th>No. Request</th><th>Barang (Item)</th><th>Status</th><th>Keterangan</th><th>Tanggal</th></tr></thead>
                            <tbody>
                                {items.length === 0 ? <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Belum ada request</td></tr>
                                    : items.map(item => (
                                        <tr key={item.id_request}>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#60A5FA' }}>{item.no_request}</td>
                                            <td>
                                                {item.details.slice(0, 2).map((d, i) => (
                                                    <div key={i} style={{ fontSize: 12, color: '#94A3B8' }}>• {d.barang.nama_barang} <span style={{ color: '#64748B' }}>({d.jumlah} unit)</span></div>
                                                ))}
                                                {item.details.length > 2 && <div style={{ fontSize: 11, color: '#475569' }}>+{item.details.length - 2} item lainnya</div>}
                                            </td>
                                            <td><span className={`badge ${getStatusBadgeColor(item.status)}`}>{statusLabel[item.status] ?? item.status}</span></td>
                                            <td style={{ fontSize: 12, color: '#64748B', maxWidth: 200 }}>{item.keterangan ?? '-'}</td>
                                            <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_request)}</td>
                                        </tr>
                                    ))}
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
