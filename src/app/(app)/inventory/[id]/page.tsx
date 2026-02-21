'use client'

import { useEffect, useState } from 'react'
import { ArrowLeft, Package, Clock, History, BarChart3, Hash } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { formatRupiah, formatDate } from '@/lib/utils'

export default function InventoryDetailPage() {
    const params = useParams()
    const id = params?.id

    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!id) return
        setLoading(true)
        fetch(`/api/inventory/${id}`)
            .then(r => r.json())
            .then(d => { setData(d); setLoading(false) })
            .catch(() => setLoading(false))
    }, [id])

    if (loading) return <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat detail barang...</div>
    if (!data?.item) return <div style={{ padding: 48, textAlign: 'center', color: '#EF4444' }}>Data barang tidak ditemukan.</div>

    const { item, historyMasuk, historyKeluar, serialNumbers } = data

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <Link href="/inventory" className="btn btn-secondary btn-sm" style={{ padding: '8px 12px' }}>
                    <ArrowLeft size={16} /> Kembali
                </Link>
                <div>
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 10 }}>
                        <Package size={24} color="#3B82F6" /> {item.nama_barang}
                    </h1>
                    <p style={{ fontSize: 13, color: '#94A3B8', marginTop: 4, fontFamily: 'monospace' }}>
                        KODE: {item.kode_barang} {item.sn === 'ya' ? ' • (Serial Number Tracked)' : ''}
                    </p>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart3 size={16} color="#10B981" /> Detail Stok & Informasi</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
                            <span style={{ color: '#64748B', fontSize: 13 }}>Kategori</span>
                            <span style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500 }}>{item.kategori?.kategori || '-'}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
                            <span style={{ color: '#64748B', fontSize: 13 }}>Stok Baru saat ini</span>
                            <span style={{ color: '#10B981', fontSize: 15, fontWeight: 700 }}>{item.stok_barang_baru} {item.satuan}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
                            <span style={{ color: '#64748B', fontSize: 13 }}>Stok Dismantle</span>
                            <span style={{ color: '#F59E0B', fontSize: 13, fontWeight: 600 }}>{item.stok_dismantle} {item.satuan}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #1E293B', paddingBottom: 8 }}>
                            <span style={{ color: '#64748B', fontSize: 13 }}>Batas Minimum Stok</span>
                            <span style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500 }}>{item.stok_min} {item.satuan}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <span style={{ color: '#64748B', fontSize: 13 }}>Harga Satuan</span>
                            <span style={{ color: '#F1F5F9', fontSize: 13, fontWeight: 500 }}>{formatRupiah(item.harga_barang)}</span>
                        </div>
                    </div>
                </div>

                {item.sn === 'ya' && (
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 24, maxHeight: 310, overflowY: 'auto' }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><Hash size={16} color="#8B5CF6" /> Daftar Serial Number (Keluar)</h3>
                        {serialNumbers.length === 0 ? <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', padding: 20 }}>Belum ada SN yang tercatat</p> : (
                            <table style={{ width: '100%', fontSize: 12, textAlign: 'left', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ color: '#94A3B8', borderBottom: '1px solid #1E293B' }}>
                                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Serial Number</th>
                                        <th style={{ paddingBottom: 8, fontWeight: 500 }}>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {serialNumbers.map((s: any) => (
                                        <tr key={s.id_sn} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '8px 0', color: '#60A5FA', fontFamily: 'monospace' }}>{s.serial_number}</td>
                                            <td style={{ padding: '8px 0', color: s.id_status === 1 ? '#10B981' : '#F59E0B' }}>
                                                {s.id_status === 1 ? 'Di Gudang (Retur)' : 'Deployed/Keluar'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 24, maxHeight: 400, overflowY: 'auto' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><History size={16} color="#3B82F6" /> Riwayat Barang Masuk</h3>
                    {historyMasuk.length === 0 ? <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', padding: 20 }}>Belum ada riwayat masuk</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {historyMasuk.map((h: any) => (
                                <div key={h.id_masuk} style={{ padding: 12, background: 'rgba(59,130,246,0.05)', borderRadius: 8, border: '1px solid rgba(59,130,246,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#38BDF8' }}>+{h.jumlah} {item.satuan}</span>
                                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDate(h.tgl_masuk || new Date().toISOString())}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>{h.keterangan || 'Tanpa keterangan'}</div>
                                    {h.no_po && <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Ref PO: {h.no_po}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, padding: 24, maxHeight: 400, overflowY: 'auto' }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}><History size={16} color="#EF4444" /> Riwayat Barang Keluar</h3>
                    {historyKeluar.length === 0 ? <p style={{ color: '#64748B', fontSize: 13, textAlign: 'center', padding: 20 }}>Belum ada riwayat keluar</p> : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            {historyKeluar.map((h: any) => (
                                <div key={h.id_keluar} style={{ padding: 12, background: 'rgba(239,68,68,0.05)', borderRadius: 8, border: '1px solid rgba(239,68,68,0.2)' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                        <span style={{ fontSize: 13, fontWeight: 600, color: '#F87171' }}>-{h.jumlah} {item.satuan}</span>
                                        <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} /> {formatDate(h.tgl_keluar || new Date().toISOString())}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: '#cbd5e1' }}>{h.keterangan || 'Tanpa keterangan'}</div>
                                    {h.no_request && <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Ref Req: {h.no_request}</div>}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
