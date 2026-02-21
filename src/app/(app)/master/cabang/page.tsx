'use client'
import { useEffect, useState } from 'react'
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react'

interface Cabang {
    id_cabang: number;
    cabang: string;
    alamat: string | null;
    id_area: number | null;
    _count?: { userCabang: number }
}

export default function MasterCabangPage() {
    const [items, setItems] = useState<Cabang[]>([])
    const [loading, setLoading] = useState(true)

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [formData, setFormData] = useState({ cabang: '', alamat: '', id_area: '' })

    const loadData = () => {
        setLoading(true)
        fetch('/api/master/cabang').then(r => r.json()).then(d => {
            setItems(d.items || []); setLoading(false)
        })
    }

    useEffect(() => { loadData() }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editId ? 'PUT' : 'POST'
        const url = editId ? `/api/master/cabang/${editId}` : '/api/master/cabang'

        await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false); setEditId(null); loadData()
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus cabang ini?')) return
        await fetch(`/api/master/cabang/${id}`, { method: 'DELETE' })
        loadData()
    }

    const openEdit = (c: Cabang) => {
        setFormData({
            cabang: c.cabang,
            alamat: c.alamat || '',
            id_area: c.id_area?.toString() || ''
        })
        setEditId(c.id_cabang)
        setShowModal(true)
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <MapPin size={22} color="#F59E0B" /> Master Cabang
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Kelola daftar cabang dan lokasi</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setFormData({ cabang: '', alamat: '', id_area: '' }); setShowModal(true) }}>
                    <Plus size={15} /> Tambah Cabang
                </button>
            </div>

            <div className="page-content">
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat data...</div> :
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Nama Cabang</th>
                                    <th>Alamat / Lokasi</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(c => (
                                    <tr key={c.id_cabang}>
                                        <td style={{ fontWeight: 500, color: '#F1F5F9' }}>{c.cabang}</td>
                                        <td style={{ color: '#94A3B8' }}>{c.alamat || '-'}</td>
                                        <td style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(c)} style={{ padding: 6 }}><Edit size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(c.id_cabang)} style={{ padding: 6, color: '#EF4444' }}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan={4} style={{ textAlign: 'center', color: '#64748B' }}>Tidak ada cabang ditemukan.</td></tr>}
                            </tbody>
                        </table>
                    }
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, width: 400, padding: 24 }}>
                        <h2 style={{ fontSize: 18, color: '#F1F5F9', marginBottom: 16 }}>{editId ? 'Edit Cabang' : 'Tambah Cabang'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div>
                                <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Nama Cabang</label>
                                <input required className="form-input" value={formData.cabang} onChange={e => setFormData({ ...formData, cabang: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Alamat / Lokasi</label>
                                <textarea className="form-input" style={{ minHeight: 80 }} value={formData.alamat} onChange={e => setFormData({ ...formData, alamat: e.target.value })} />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
