'use client'
import { useState } from 'react'
import { Search, MapPin, Tag, Calendar, Database, CheckCircle, AlertTriangle, ArrowRight } from 'lucide-react'
import { formatDate, getStatusBadgeColor } from '@/lib/utils'

interface AssetNode {
    id_sn: number; serial_number: string; status: string; tgl_input: string; keterangan: string | null;
    barang: { nama_barang: string; kode_barang: string }; cabang?: { cabang: string }
}

export default function AssetPage() {
    const [sn, setSn] = useState('')
    const [loading, setLoading] = useState(false)
    const [asset, setAsset] = useState<AssetNode | null>(null)
    const [searched, setSearched] = useState(false)

    const searchAsset = async (e: React.FormEvent) => {
        e.preventDefault(); if (!sn) return;
        setLoading(true); setSearched(true)
        try {
            const res = await fetch(`/api/asset?sn=${sn}`)
            if (res.ok) {
                const d = await res.json()
                setAsset(d.items.length > 0 ? d.items[0] : null)
            }
        } finally { setLoading(false) }
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'block', paddingBottom: 32 }}>
                <h1 style={{ fontSize: 24, fontWeight: 700, color: '#F1F5F9', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Search size={24} color="#8B5CF6" /> Asset Tracking
                </h1>
                <p style={{ fontSize: 13, color: '#64748B', marginBottom: 24 }}>Lacak lokasi dan status perangkat berdasarkan Serial Number.</p>

                <form onSubmit={searchAsset} style={{ display: 'flex', gap: 12, maxWidth: 600 }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={18} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: 42, paddingRight: 20, paddingTop: 14, paddingBottom: 14, fontSize: 16 }}
                            placeholder="Masukkan Serial Number (contoh: SN12345)"
                            value={sn} onChange={e => setSn(e.target.value)} autoFocus
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ padding: '0 24px' }} disabled={loading || !sn}>
                        {loading ? 'Mencari...' : 'Lacak Asset'}
                    </button>
                </form>
            </div>

            <div className="page-content">
                {!searched ? (
                    <div style={{ padding: '80px 20px', textAlign: 'center', color: '#475569' }}>
                        <Database size={48} style={{ margin: '0 auto 16px', opacity: 0.2 }} />
                        <p>Masukkan Serial Number di atas untuk melacak asset.</p>
                    </div>
                ) : loading ? (
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
                    <div className="fade-in animate-in">
                        <div className="grid-2" style={{ gap: 24 }}>
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
                                        <div><div style={{ fontSize: 11, color: '#64748B' }}>Lokasi Saat Ini</div><div style={{ fontSize: 14, color: '#F1F5F9' }}>{asset.cabang?.cabang || 'Gudang Pusat'}</div></div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Calendar size={16} color="#94A3B8" /></div>
                                        <div><div style={{ fontSize: 11, color: '#64748B' }}>Tanggal Input</div><div style={{ fontSize: 14, color: '#F1F5F9' }}>{asset.tgl_input ? formatDate(asset.tgl_input) : '-'}</div></div>
                                    </div>
                                </div>
                            </div>

                            {/* Timeline Card */}
                            <div className="glass-card" style={{ padding: 24 }}>
                                <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 24 }}>Riwayat Pergerakan</h3>
                                <div style={{ marginLeft: 8 }}>
                                    <div className="timeline-item">
                                        <div className="timeline-dot" style={{ borderColor: '#8B5CF6' }} />
                                        <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 500 }}>Posisi Saat Ini</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Berada di {asset.cabang?.cabang || 'Gudang Pusat'} dengan status {asset.status}.</div>
                                    </div>
                                    <div className="timeline-item">
                                        <div className="timeline-dot" style={{ borderColor: '#10B981', background: '#10B981' }} />
                                        <div style={{ fontSize: 13, color: '#F1F5F9', fontWeight: 500 }}>Terdaftar di Sistem</div>
                                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>Didaftarkan pada {asset.tgl_input ? formatDate(asset.tgl_input) : 'tanggal tidak diketahui'}.</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
