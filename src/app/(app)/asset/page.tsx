'use client'
import { useState, useEffect } from 'react'
import { Search, MapPin, Tag, Calendar, Database, AlertTriangle, Package, FolderTree } from 'lucide-react'
import { formatDate, getStatusBadgeColor } from '@/lib/utils'

interface AssetNode {
    id_sn: number; serial_number: string; status: string; tgl_input: string; keterangan: string | null;
    lokasi_pop: string | null;
    barang: { nama_barang: string; kode_barang: string }; cabang?: { cabang: string }
}

export default function AssetPage() {
    const [mode, setMode] = useState<'sn' | 'pop'>('sn')

    // Mode SN
    const [sn, setSn] = useState('')
    const [snLoading, setSnLoading] = useState(false)
    const [asset, setAsset] = useState<AssetNode | null>(null)
    const [searched, setSearched] = useState(false)

    // Mode POP
    const [popLoading, setPopLoading] = useState(false)
    const [popList, setPopList] = useState<string[]>([])
    const [selectedPop, setSelectedPop] = useState('')
    const [popAssets, setPopAssets] = useState<AssetNode[]>([])
    const [popAssetsLoading, setPopAssetsLoading] = useState(false)

    useEffect(() => {
        if (mode === 'pop' && popList.length === 0) {
            setPopLoading(true)
            fetch('/api/asset/pop')
                .then(r => r.json())
                .then(d => setPopList(d))
                .catch(() => { })
                .finally(() => setPopLoading(false))
        }
    }, [mode, popList.length])

    const searchAsset = async (e: React.FormEvent) => {
        e.preventDefault(); if (!sn) return;
        setSnLoading(true); setSearched(true)
        try {
            const res = await fetch(`/api/asset?sn=${sn}`)
            if (res.ok) {
                const d = await res.json()
                setAsset(d.items.length > 0 ? d.items[0] : null)
            }
        } finally { setSnLoading(false) }
    }

    const fetchPopAssets = async (popName: string) => {
        if (!popName) { setPopAssets([]); return; }
        setPopAssetsLoading(true)
        try {
            const res = await fetch(`/api/asset?pop=${encodeURIComponent(popName)}`)
            if (res.ok) {
                const d = await res.json()
                setPopAssets(d.items || [])
            }
        } finally { setPopAssetsLoading(false) }
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'block', paddingBottom: 24 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={24} color="#8B5CF6" /> Asset Tracking
                </h1>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Lacak lokasi dan status perangkat berdasarkan Serial Number atau Kelompok POP.</p>

                {/* TABS */}
                <div style={{ display: 'flex', gap: 12, borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: 16 }}>
                    <button
                        className={`btn ${mode === 'sn' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('sn')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, ...(mode !== 'sn' ? { borderColor: 'transparent', background: 'transparent' } : {}) }}
                    >
                        <Tag size={16} /> Lacak Serial Number
                    </button>
                    <button
                        className={`btn ${mode === 'pop' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setMode('pop')}
                        style={{ display: 'flex', alignItems: 'center', gap: 8, ...(mode !== 'pop' ? { borderColor: 'transparent', background: 'transparent' } : {}) }}
                    >
                        <FolderTree size={16} /> Data Aset POP Loc.
                    </button>
                </div>
            </div>

            <div className="page-content">
                {mode === 'sn' && (
                    <div className="fade-in animate-in">
                        <form onSubmit={searchAsset} style={{ display: 'flex', gap: 12, maxWidth: 600, marginBottom: 32 }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                                <input
                                    className="input"
                                    style={{ paddingLeft: 42, paddingRight: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16 }}
                                    placeholder="Masukkan Serial Number (contoh: SN12345)"
                                    value={sn} onChange={e => setSn(e.target.value)} autoFocus
                                />
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={snLoading || !sn}>
                                {snLoading ? 'Mencari...' : 'Cari Asset'}
                            </button>
                        </form>

                        {!searched ? (
                            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#475569' }}>
                                <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                                <p>Masukkan Serial Number di atas untuk melacak detail asset.</p>
                            </div>
                        ) : snLoading ? (
                            <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>
                                <div style={{ width: 32, height: 32, borderRadius: '50%', border: '2px solid rgba(139,92,246,0.2)', borderTopColor: '#8B5CF6', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
                                Memuat data asset...
                            </div>
                        ) : !asset ? (
                            <div className="glass-card fade-in" style={{ padding: 48, textAlign: 'center', borderColor: 'rgba(239,68,68,0.2)' }}>
                                <AlertTriangle size={48} color="#EF4444" style={{ margin: '0 auto 16px', opacity: 0.8 }} />
                                <h3 style={{ fontSize: 18, color: '#F1F5F9', marginBottom: 8 }}>Asset Tidak Ditemukan</h3>
                                <p style={{ color: '#94A3B8' }}>Serial number <b>{sn}</b> tidak terdaftar di database.</p>
                            </div>
                        ) : (
                            <div className="grid-2 fade-in animate-in" style={{ gap: 24 }}>
                                {/* Asset Info Card */}
                                <div className="glass-card" style={{ padding: 24 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
                                        <div>
                                            <div style={{ fontSize: 11, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Informasi Perangkat</div>
                                            <h2 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>{asset.barang.nama_barang}</h2>
                                            <div style={{ fontSize: 13, color: '#60A5FA', fontFamily: 'monospace', marginTop: 4 }}>{asset.barang.kode_barang}</div>
                                        </div>
                                        <span className={`badge ${getStatusBadgeColor(asset.status)}`} style={{ padding: '6px 12px', fontSize: 13 }}>
                                            {asset.status.toUpperCase()}
                                        </span>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Tag size={16} color="#94A3B8" /></div>
                                            <div><div style={{ fontSize: 11, color: '#64748B' }}>Serial Number</div><div style={{ fontSize: 14, color: '#F1F5F9', fontFamily: 'monospace' }}>{asset.serial_number}</div></div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><MapPin size={16} color="#94A3B8" /></div>
                                            <div>
                                                <div style={{ fontSize: 11, color: '#64748B' }}>Lokasi Saat Ini</div>
                                                <div style={{ fontSize: 14, color: '#F1F5F9' }}>
                                                    {asset.lokasi_pop ? `POP: ${asset.lokasi_pop}` : (asset.cabang?.cabang || 'Gudang Pusat')}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#94A3B8" /></div>
                                            <div><div style={{ fontSize: 11, color: '#64748B' }}>Tanggal Deploy</div><div style={{ fontSize: 14, color: '#F1F5F9' }}>{asset.tgl_input ? formatDate(asset.tgl_input) : '-'}</div></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Timeline Card */}
                                <div className="glass-card" style={{ padding: 24 }}>
                                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 24 }}>Riwayat Status</h3>
                                    <div style={{ marginLeft: 8 }}>
                                        <div className="timeline-item">
                                            <div className="timeline-dot" style={{ borderColor: '#8B5CF6' }} />
                                            <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 500 }}>Posisi Saat Ini ({asset.status})</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>
                                                Berada di {asset.lokasi_pop ? `POP ${asset.lokasi_pop}` : (asset.cabang?.cabang || 'Gudang Pusat')}.
                                                {asset.tgl_input && ` Dideploy sejak ${formatDate(asset.tgl_input)}.`}
                                            </div>
                                        </div>
                                        <div className="timeline-item">
                                            <div className="timeline-dot" style={{ borderColor: '#10B981', background: '#10B981' }} />
                                            <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 500 }}>Pertama Terdaftar</div>
                                            <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Diterima masuk ke gudang utama sistem.</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {mode === 'pop' && (
                    <div className="fade-in animate-in">
                        <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                            <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16 }}>Pilih Titik Lokasi / POP</h3>
                            {popLoading ? (
                                <div style={{ color: '#64748B', fontSize: 13 }}>Memuat daftar lokasi POP...</div>
                            ) : popList.length === 0 ? (
                                <div style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>Belum ada data barang/aset yang dikeluarkan spesifik untuk POP Location sejauh ini.</div>
                            ) : (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
                                    {popList.map((p, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => { setSelectedPop(p); fetchPopAssets(p); }}
                                            style={{
                                                padding: '12px 16px', background: selectedPop === p ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.03)',
                                                border: `1px solid ${selectedPop === p ? '#8B5CF6' : '#1E293B'}`,
                                                borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                                                color: selectedPop === p ? '#A78BFA' : '#CBD5E1', fontWeight: 500
                                            }}
                                            className="hover-card"
                                        >
                                            <MapPin size={18} /> {p}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedPop && (
                            <div className="fade-in animate-in">
                                <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                                    Daftar Perangkat di <span style={{ color: '#A78BFA' }}>{selectedPop}</span>
                                </h3>
                                <div className="data-table-container">
                                    {popAssetsLoading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat perangkat...</div> : (
                                        <table className="data-table">
                                            <thead>
                                                <tr><th>No</th><th>Barang & Model</th><th>Serial Number</th><th>Tanggal Deploy</th></tr>
                                            </thead>
                                            <tbody>
                                                {popAssets.length === 0 ? <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>Tidak ada data aset terdaftar di lokasi ini.</td></tr>
                                                    : popAssets.map((item, idx) => (
                                                        <tr key={item.id_sn}>
                                                            <td style={{ color: '#475569', fontSize: 13 }}>{idx + 1}</td>
                                                            <td>
                                                                <div style={{ color: '#F1F5F9', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                                    <Package size={14} color="#60A5FA" /> {item.barang.nama_barang}
                                                                </div>
                                                                <div style={{ fontSize: 11, color: '#64748B', fontFamily: 'monospace', marginLeft: 20 }}>{item.barang.kode_barang}</div>
                                                            </td>
                                                            <td><div style={{ fontFamily: 'monospace', color: '#60A5FA', background: 'rgba(59,130,246,0.1)', display: 'inline-block', padding: '4px 8px', borderRadius: 6, fontSize: 12 }}>{item.serial_number}</div></td>
                                                            <td style={{ fontSize: 13, color: '#94A3B8' }}>{item.tgl_input ? formatDate(item.tgl_input) : '-'}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
