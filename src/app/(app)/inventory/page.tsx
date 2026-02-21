'use client'

import { useEffect, useState, useCallback } from 'react'
import { Package, Search, Filter, Plus, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
import { formatRupiah, getStokStatus, getStokBadgeColor } from '@/lib/utils'
import Link from 'next/link'

interface BarangItem {
    id_barang: number
    kode_barang: string
    nama_barang: string
    stok_barang_baru: number
    stok_dismantle: number
    stok_min: string
    sn: string
    satuan: string
    harga_barang: number
    tgl_input: string
    kategori: { id_kategori: number; kategori: string } | null
}

interface KategoriItem {
    id_kategori: number
    kategori: string
}

export default function InventoryPage() {
    const [items, setItems] = useState<BarangItem[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [search, setSearch] = useState('')
    const [kategori, setKategori] = useState('')
    const [kategoriList, setKategoriList] = useState<KategoriItem[]>([])
    const [loading, setLoading] = useState(true)

    const fetchKategori = async () => {
        try {
            const res = await fetch('/api/master/kategori')
            if (res.ok) { const d = await res.json(); setKategoriList(d.items || []) }
        } catch { /* ignore */ }
    }

    const fetchItems = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({ page: String(page), limit: '25' })
            if (search) params.append('search', search)
            if (kategori) params.append('kategori', kategori)
            const res = await fetch(`/api/inventory?${params}`)
            if (res.ok) {
                const d = await res.json()
                setItems(d.items)
                setTotal(d.total)
            }
        } catch { /* ignore */ }
        finally { setLoading(false) }
    }, [page, search, kategori])

    useEffect(() => { fetchKategori() }, [])
    useEffect(() => { fetchItems() }, [fetchItems])

    const totalPages = Math.ceil(total / 25)
    const stokHabis = items.filter(i => (i.stok_barang_baru ?? 0) <= 0).length
    const stokMenipis = items.filter(i => (i.stok_barang_baru ?? 0) > 0 && (i.stok_barang_baru ?? 0) <= 5).length

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>Inventory</h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>
                        {total.toLocaleString()} item · {stokHabis} habis · {stokMenipis} menipis
                    </p>
                </div>
                <Link href="/master/barang/new" className="btn btn-primary btn-sm">
                    <Plus size={15} /> Tambah Barang
                </Link>
            </div>

            <div className="page-content">
                {/* Summary badges */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8, fontSize: 13 }}>
                        <CheckCircle size={15} color="#10B981" />
                        <span style={{ color: '#10B981', fontWeight: 600 }}>{items.filter(i => (i.stok_barang_baru ?? 0) > 5).length}</span>
                        <span style={{ color: '#94A3B8' }}>Stok Aman</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, fontSize: 13 }}>
                        <AlertTriangle size={15} color="#F59E0B" />
                        <span style={{ color: '#F59E0B', fontWeight: 600 }}>{stokMenipis}</span>
                        <span style={{ color: '#94A3B8' }}>Stok Menipis</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, fontSize: 13 }}>
                        <XCircle size={15} color="#EF4444" />
                        <span style={{ color: '#EF4444', fontWeight: 600 }}>{stokHabis}</span>
                        <span style={{ color: '#94A3B8' }}>Stok Habis</span>
                    </div>
                </div>

                {/* Filter bar */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
                        <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                        <input
                            className="input"
                            style={{ paddingLeft: 34 }}
                            placeholder="Cari kode atau nama barang..."
                            value={search}
                            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
                        />
                    </div>
                    <div style={{ position: 'relative' }}>
                        <Filter size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#64748B' }} />
                        <select className="input" style={{ paddingLeft: 34, minWidth: 200 }} value={kategori} onChange={(e) => { setKategori(e.target.value); setPage(1) }}>
                            <option value="">Semua Kategori</option>
                            {kategoriList.map((k) => (
                                <option key={k.id_kategori} value={k.id_kategori}>{k.kategori}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="data-table-container">
                    {loading ? (
                        <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>Memuat data...</div>
                    ) : (
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Kode</th>
                                    <th>Nama Barang</th>
                                    <th>Kategori</th>
                                    <th>SN</th>
                                    <th style={{ textAlign: 'right' }}>Stok Baru</th>
                                    <th style={{ textAlign: 'right' }}>Dismantle</th>
                                    <th>Status Stok</th>
                                    <th style={{ textAlign: 'right' }}>Harga</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.length === 0 ? (
                                    <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: '#475569' }}>
                                        <Package size={32} style={{ margin: '0 auto 12px', opacity: 0.3, display: 'block' }} />
                                        Tidak ada data ditemukan
                                    </td></tr>
                                ) : items.map((item) => {
                                    const stok = item.stok_barang_baru ?? 0
                                    const stokMin = parseInt(item.stok_min ?? '5')
                                    const status = getStokStatus(stok, stokMin)
                                    const badgeColor = getStokBadgeColor(status)
                                    const statusLabel = status === 'aman' ? '✓ Aman' : status === 'menipis' ? '⚠ Menipis' : '✗ Habis'
                                    return (
                                        <tr key={item.id_barang}>
                                            <td style={{ fontFamily: 'monospace', fontSize: 12 }}>
                                                <Link href={`/inventory/${item.id_barang}`} style={{ color: '#60A5FA', textDecoration: 'none' }}>
                                                    {item.kode_barang}
                                                </Link>
                                            </td>
                                            <td>
                                                <Link href={`/inventory/${item.id_barang}`} style={{ display: 'block', textDecoration: 'none' }}>
                                                    <div style={{ color: '#F1F5F9', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}>
                                                        {item.nama_barang}
                                                    </div>
                                                    <div style={{ fontSize: 11, color: '#475569' }}>{item.satuan}</div>
                                                </Link>
                                            </td>
                                            <td style={{ fontSize: 12 }}>{item.kategori?.kategori ?? '-'}</td>
                                            <td>
                                                <span className="badge" style={{
                                                    background: item.sn === 'ada' ? 'rgba(139,92,246,0.15)' : 'rgba(71,85,105,0.2)',
                                                    color: item.sn === 'ada' ? '#A78BFA' : '#64748B',
                                                    border: 'none', fontSize: 10
                                                }}>
                                                    {item.sn === 'ada' ? '🔖 Ada SN' : 'Tanpa SN'}
                                                </span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontWeight: 600, color: stok <= 0 ? '#EF4444' : stok <= 5 ? '#F59E0B' : '#10B981' }}>
                                                {stok.toLocaleString('id-ID')}
                                            </td>
                                            <td style={{ textAlign: 'right', color: '#64748B' }}>
                                                {(item.stok_dismantle ?? 0).toLocaleString('id-ID')}
                                            </td>
                                            <td>
                                                <span className={`badge ${badgeColor}`}>{statusLabel}</span>
                                            </td>
                                            <td style={{ textAlign: 'right', fontSize: 12 }}>
                                                {item.harga_barang > 0 ? formatRupiah(item.harga_barang) : <span style={{ color: '#475569' }}>-</span>}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '12px 0' }}>
                        <span style={{ fontSize: 13, color: '#64748B' }}>
                            Halaman {page} dari {totalPages} · Total {total} item
                        </span>
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
