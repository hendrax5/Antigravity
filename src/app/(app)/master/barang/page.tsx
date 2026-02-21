'use client'
import { useEffect, useState } from 'react'
import { PackageOpen, Plus, Search, Edit, Trash2 } from 'lucide-react'

interface Kategori { id_kategori: number; kategori: string }
interface Barang {
    id_barang: number;
    kategori: Kategori;
    kode_barang: string;
    nama_barang: string;
    stok_barang_baru: number;
    stok_dismantle: number;
    sn: string;
    satuan: string;
    harga_barang: number;
}

export default function MasterBarangPage() {
    const [items, setItems] = useState<Barang[]>([])
    const [kategoris, setKategoris] = useState<Kategori[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    // Modal state
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        id_kategori: '', kode_barang: '', nama_barang: '', sn: 'tidak',
        stok_barang_baru: '', stok_dismantle: '', satuan: 'pcs', harga_barang: ''
    })

    const loadData = () => {
        setLoading(true)
        fetch(`/api/master/barang?search=${search}`).then(r => r.json()).then(d => {
            setItems(d.items || []); setLoading(false)
        })
    }

    useEffect(() => {
        loadData()
        fetch('/api/master/kategori').then(r => r.json()).then(d => setKategoris(d.items || []))
    }, [search])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editId ? 'PUT' : 'POST'
        const url = editId ? `/api/master/barang/${editId}` : '/api/master/barang'

        await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false); setEditId(null); loadData()
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus barang ini?')) return
        await fetch(`/api/master/barang/${id}`, { method: 'DELETE' })
        loadData()
    }

    const openEdit = (b: Barang) => {
        setFormData({
            id_kategori: b.kategori?.id_kategori.toString(),
            kode_barang: b.kode_barang, nama_barang: b.nama_barang,
            sn: b.sn || 'tidak', satuan: b.satuan || 'pcs',
            stok_barang_baru: b.stok_barang_baru?.toString() || '0',
            stok_dismantle: b.stok_dismantle?.toString() || '0',
            harga_barang: b.harga_barang?.toString() || '0'
        })
        setEditId(b.id_barang)
        setShowModal(true)
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <PackageOpen size={22} color="#3B82F6" /> Master Barang
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Kelola database item dan stok awal</p>
                </div>
                <div style={{ display: 'flex', gap: 12 }}>
                    <div className="search-bar">
                        <Search size={16} />
                        <input type="text" placeholder="Cari nama atau kode..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setFormData({ id_kategori: '', kode_barang: '', nama_barang: '', sn: 'tidak', stok_barang_baru: '', stok_dismantle: '', satuan: 'pcs', harga_barang: '' }); setShowModal(true) }}>
                        <Plus size={15} /> Tambah Barang
                    </button>
                </div>
            </div>

            <div className="page-content">
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat data...</div> :
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>Stok Baru</th>
                                    <th>Stok Dismantle</th>
                                    <th>Harga</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(b => (
                                    <tr key={b.id_barang}>
                                        <td style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{b.kode_barang}</td>
                                        <td style={{ fontWeight: 500, color: '#F1F5F9' }}>
                                            {b.nama_barang}
                                            {b.sn === 'ya' && <span style={{ marginLeft: 8, fontSize: 10, background: '#1E293B', color: '#38BDF8', padding: '2px 6px', borderRadius: 4 }}>Ber-SN</span>}
                                        </td>
                                        <td>{b.kategori?.kategori || '-'}</td>
                                        <td>{b.stok_barang_baru} {b.satuan}</td>
                                        <td>{b.stok_dismantle} {b.satuan}</td>
                                        <td>Rp {b.harga_barang?.toLocaleString('id-ID')}</td>
                                        <td style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(b)} style={{ padding: 6 }}><Edit size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(b.id_barang)} style={{ padding: 6, color: '#EF4444' }}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan={7} style={{ textAlign: 'center', color: '#64748B' }}>Tidak ada barang ditemukan.</td></tr>}
                            </tbody>
                        </table>
                    }
                </div>
            </div>

            {/* Simple Modal */}
            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, width: 500, padding: 24 }}>
                        <h2 style={{ fontSize: 18, color: '#F1F5F9', marginBottom: 16 }}>{editId ? 'Edit Barang' : 'Tambah Barang'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Kode Barang</label>
                                    <input required className="form-input" value={formData.kode_barang} onChange={e => setFormData({ ...formData, kode_barang: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Kategori</label>
                                    <select required className="form-input" value={formData.id_kategori} onChange={e => setFormData({ ...formData, id_kategori: e.target.value })}>
                                        <option value="">Pilih Kategori...</option>
                                        {kategoris.map(k => <option key={k.id_kategori} value={k.id_kategori}>{k.kategori}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Nama Barang</label>
                                <input required className="form-input" value={formData.nama_barang} onChange={e => setFormData({ ...formData, nama_barang: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Stok Baru</label>
                                    <input type="number" className="form-input" value={formData.stok_barang_baru} onChange={e => setFormData({ ...formData, stok_barang_baru: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Stok Dismantle</label>
                                    <input type="number" className="form-input" value={formData.stok_dismantle} onChange={e => setFormData({ ...formData, stok_dismantle: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Satuan</label>
                                    <input className="form-input" value={formData.satuan} onChange={e => setFormData({ ...formData, satuan: e.target.value })} placeholder="pcs/unit/m" />
                                </div>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Gunakan Serial Number?</label>
                                    <select className="form-input" value={formData.sn} onChange={e => setFormData({ ...formData, sn: e.target.value })}>
                                        <option value="tidak">Tidak (Bulk)</option>
                                        <option value="ya">Ya (Individual SN)</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Harga (Rp)</label>
                                    <input type="number" className="form-input" value={formData.harga_barang} onChange={e => setFormData({ ...formData, harga_barang: e.target.value })} />
                                </div>
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
