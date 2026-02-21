'use client'
import { useEffect, useState } from 'react'
import { Database, Plus } from 'lucide-react'

interface Kategori { id_kategori: number; kategori: string; kode: string | null; _count: { barang: number } }

export default function MasterKategoriPage() {
    const [items, setItems] = useState<Kategori[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/master/kategori').then(r => r.json()).then(d => { setItems(d.items); setLoading(false) })
    }, [])

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Database size={22} color="#10B981" /> Master Kategori
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Kelola daftar kategori barang</p>
                </div>
                <button className="btn btn-primary btn-sm"><Plus size={15} /> Tambah Kategori</button>
            </div>
            <div className="page-content">
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat...</div> :
                        <table className="data-table">
                            <thead><tr><th>Nama Kategori</th><th>Kode</th><th>Jumlah Barang</th><th>Aksi</th></tr></thead>
                            <tbody>
                                {items.map(k => (
                                    <tr key={k.id_kategori}>
                                        <td style={{ fontWeight: 500, color: '#F1F5F9' }}>{k.kategori}</td>
                                        <td style={{ fontFamily: 'monospace', color: '#94A3B8' }}>{k.kode ?? '-'}</td>
                                        <td>{k._count.barang} item</td>
                                        <td><button className="btn btn-secondary btn-sm" style={{ padding: '4px 8px', fontSize: 11 }}>Edit</button></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    }
                </div>
            </div>
        </div>
    )
}
