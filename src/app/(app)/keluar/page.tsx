'use client'
import { useEffect, useState, useCallback } from 'react'
import { ArrowUpCircle, Plus, Search, Trash2, ShoppingCart, MapPin } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import Link from 'next/link'

interface BarangKeluar {
    id_keluar: number; jumlah: number; tgl_keluar: string;
    keterangan: string | null; no_request: string | null;
    barang: { id_barang: number; nama_barang: string; kode_barang: string; satuan: string | null }
}
interface BarangOption { id_barang: number; nama_barang: string; kode_barang: string }
interface CartItem { id_barang: number; nama_barang: string; kode_barang: string; jumlah: number; serial_numbers: string[] }

export default function KeluarPage() {
    const [items, setItems] = useState<BarangKeluar[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [barangList, setBarangList] = useState<BarangOption[]>([])

    // Global checkout form
    const [globalForm, setGlobalForm] = useState({ tgl_keluar: new Date().toISOString().split('T')[0], no_request: '', keterangan: '', is_pop: false, lokasi_pop: '' })
    const [cart, setCart] = useState<CartItem[]>([])

    // Active item drafting
    const [activeItem, setActiveItem] = useState({ id_barang: '', jumlah: '' })
    const [availableSNs, setAvailableSNs] = useState<any[]>([])
    const [selectedSNs, setSelectedSNs] = useState<string[]>([])

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

    const handleBarangChange = async (val: string) => {
        setActiveItem({ ...activeItem, id_barang: val })
        setSelectedSNs([])
        if (val) {
            try {
                const res = await fetch(`/api/inventory/${val}`)
                if (res.ok) {
                    const d = await res.json()
                    const available = (d.serialNumbers || []).filter((s: any) => s.id_status === 1)
                    setAvailableSNs(available)
                }
            } catch { setAvailableSNs([]) }
        } else {
            setAvailableSNs([])
        }
    }

    const toggleSN = (sn: string) => {
        setSelectedSNs(prev => {
            const next = prev.includes(sn) ? prev.filter(s => s !== sn) : [...prev, sn];
            setActiveItem(curr => ({ ...curr, jumlah: next.length.toString() }));
            return next;
        })
    }

    const scanSN = (sn: string) => {
        const found = availableSNs.find(a => a.serial_number === sn)
        if (found) {
            if (!selectedSNs.includes(sn)) {
                setSelectedSNs(prev => {
                    const next = [...prev, sn];
                    setActiveItem(curr => ({ ...curr, jumlah: next.length.toString() }));
                    return next;
                })
            }
        } else {
            alert("SN tidak ditemukan di daftar stok tersedia.")
        }
    }

    const addToCart = () => {
        if (!activeItem.id_barang || !activeItem.jumlah) return alert('Pilih barang dan jumlah')
        const qty = parseInt(activeItem.jumlah)
        if (availableSNs.length > 0 && selectedSNs.length !== qty) {
            return alert(`Barang ini memiliki Serial Number. Anda harus memilih tepat ${qty} SN.`)
        }
        const bInfo = barangList.find(b => b.id_barang === parseInt(activeItem.id_barang))
        if (!bInfo) return

        setCart(prev => [...prev, {
            id_barang: bInfo.id_barang,
            nama_barang: bInfo.nama_barang,
            kode_barang: bInfo.kode_barang,
            jumlah: qty,
            serial_numbers: selectedSNs
        }])

        // Reset drafter
        setActiveItem({ id_barang: '', jumlah: '' })
        setSelectedSNs([])
        setAvailableSNs([])
    }

    const removeFromCart = (index: number) => {
        const next = [...cart]; next.splice(index, 1); setCart(next);
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (cart.length === 0) return alert('Keranjang kosong. Tambahkan barang terlebih dahulu.')
        setSaving(true)
        try {
            const res = await fetch('/api/keluar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tgl_keluar: globalForm.tgl_keluar,
                    no_request: globalForm.no_request,
                    keterangan: globalForm.keterangan,
                    is_pop: globalForm.is_pop,
                    lokasi_pop: globalForm.is_pop ? globalForm.lokasi_pop : null,
                    items: cart
                })
            })
            if (res.ok) {
                setShowForm(false);
                setGlobalForm({ tgl_keluar: new Date().toISOString().split('T')[0], no_request: '', keterangan: '', is_pop: false, lokasi_pop: '' })
                setCart([])
                fetchItems()
            } else {
                const errData = await res.json()
                alert(`Gagal menyimpan transaksi: ${errData.error || 'Terjadi kesalahan sistem.'}`)
            }
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
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}><Plus size={15} /> Buat Transaksi Keluar</button>
            </div>
            <div className="page-content">
                {showForm && (
                    <div className="glass-card fade-in" style={{ padding: 24, marginBottom: 24, border: '2px solid rgba(59,130,246,0.2)' }}>
                        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
                            <ShoppingCart size={18} color="#60A5FA" /> Keranjang Multi-Item (Checkout)
                        </h3>

                        <div className="grid-2" style={{ gap: 24 }}>
                            {/* Kiri: Tambah Barang */}
                            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 12, border: '1px solid rgba(255,255,255,0.05)' }}>
                                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>1. Tambah Barang ke Keranjang</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Pilih Barang</label>
                                        <select className="input" value={activeItem.id_barang} onChange={e => handleBarangChange(e.target.value)}>
                                            <option value="">-- Cari Barang --</option>
                                            {barangList.map(b => <option key={b.id_barang} value={b.id_barang}>{b.kode_barang} - {b.nama_barang}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Kuantitas (Jumlah)</label>
                                        <input
                                            className="input"
                                            type="number" min="1"
                                            value={activeItem.jumlah}
                                            onChange={e => setActiveItem({ ...activeItem, jumlah: e.target.value })}
                                            placeholder="0"
                                            readOnly={availableSNs.length > 0}
                                            style={availableSNs.length > 0 ? { opacity: 0.7, background: 'rgba(255,255,255,0.05)' } : {}}
                                        />
                                    </div>

                                    {availableSNs.length > 0 && (
                                        <div style={{ marginTop: 8, padding: 12, background: 'rgba(15,23,42,0.5)', borderRadius: 8, border: '1px solid #1E293B' }}>
                                            <div style={{ marginBottom: 12, padding: '8px 12px', background: 'rgba(59,130,246,0.1)', borderRadius: 6, border: '1px solid rgba(59,130,246,0.2)' }}>
                                                <p style={{ fontSize: 12, color: '#60A5FA', margin: 0 }}>
                                                    ℹ️ Barang ini melacak <b>Serial Number</b>. Silakan Scan Barcode atau centang SN di bawah. Jumlah/Kuantitas akan otomatis menyesuaikan daftar SN yang Anda pilih.
                                                </p>
                                            </div>
                                            <label style={{ fontSize: 13, color: '#F1F5F9', display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontWeight: 500 }}>
                                                <span>Pilih/Scan SN</span>
                                                <span style={{ color: selectedSNs.length > 0 ? '#10B981' : '#F59E0B' }}>
                                                    {selectedSNs.length} dipilih
                                                </span>
                                            </label>
                                            {/* Infrared Barcode Scanner Input */}
                                            <input
                                                className="input"
                                                style={{ marginBottom: 12, border: '1px solid #3B82F6' }}
                                                placeholder="[SCAN BARCODE / KETIK SN DISINI & ENTER]"
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        scanSN(e.currentTarget.value)
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 6, maxHeight: 150, overflowY: 'auto', paddingRight: 4 }}>
                                                {availableSNs.map((snItem) => {
                                                    const isSelected = selectedSNs.includes(snItem.serial_number);
                                                    return (
                                                        <label key={snItem.id_sn} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 8px', background: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${isSelected ? '#3B82F6' : '#1E293B'}`, borderRadius: 6, cursor: 'pointer' }}>
                                                            <input
                                                                type="checkbox" checked={isSelected}
                                                                onChange={() => toggleSN(snItem.serial_number)}
                                                                style={{ accentColor: '#3B82F6', width: 14, height: 14 }}
                                                            />
                                                            <span style={{ fontSize: 11, fontFamily: 'monospace', color: isSelected ? '#60A5FA' : '#94A3B8' }}>{snItem.serial_number}</span>
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    )}

                                    <button type="button" className="btn btn-secondary" style={{ marginTop: 8 }} onClick={addToCart}>
                                        + Masukkan ke Keranjang
                                    </button>
                                </div>
                            </div>

                            {/* Kanan: Cart & Global Info */}
                            <div>
                                <h4 style={{ fontSize: 14, fontWeight: 600, color: '#E2E8F0', marginBottom: 16 }}>2. Daftar Pengeluaran & Checkout</h4>
                                <div style={{ background: 'rgba(15,23,42,0.5)', borderRadius: 12, border: '1px solid #1E293B', padding: 12, minHeight: 120, marginBottom: 16 }}>
                                    {cart.length === 0 ? (
                                        <div style={{ color: '#64748B', fontSize: 12, textAlign: 'center', padding: '30px 0' }}>Keranjang masih kosong</div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                            {cart.map((c, i) => (
                                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '10px 12px', borderRadius: 8 }}>
                                                    <div>
                                                        <div style={{ fontSize: 13, fontWeight: 600, color: '#F1F5F9' }}>{c.nama_barang}</div>
                                                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{c.jumlah} unit {c.serial_numbers.length > 0 ? `(${c.serial_numbers.length} SN)` : ''}</div>
                                                    </div>
                                                    <button type="button" onClick={() => removeFromCart(i)} style={{ background: 'transparent', border: 'none', color: '#EF4444', cursor: 'pointer', padding: 4 }}>
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                                    <div className="grid-2" style={{ gap: 12 }}>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Tanggal Keluar</label>
                                            <input className="input" type="date" value={globalForm.tgl_keluar} onChange={e => setGlobalForm({ ...globalForm, tgl_keluar: e.target.value })} required />
                                        </div>
                                        <div>
                                            <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>No. Request</label>
                                            <input className="input" value={globalForm.no_request} onChange={e => setGlobalForm({ ...globalForm, no_request: e.target.value })} placeholder="Opsional" />
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Keterangan Umum</label>
                                        <textarea className="input" value={globalForm.keterangan} onChange={e => setGlobalForm({ ...globalForm, keterangan: e.target.value })} placeholder="Alasan pengeluaran..." rows={2} />
                                    </div>

                                    {/* ASSET POP CHECKBOX */}
                                    <div style={{ padding: 12, background: globalForm.is_pop ? 'rgba(139,92,246,0.1)' : 'rgba(255,255,255,0.02)', borderRadius: 8, border: `1px solid ${globalForm.is_pop ? '#8B5CF6' : 'rgba(255,255,255,0.05)'}` }}>
                                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                                            <input type="checkbox" checked={globalForm.is_pop} onChange={e => setGlobalForm({ ...globalForm, is_pop: e.target.checked })} style={{ width: 16, height: 16, accentColor: '#8B5CF6' }} />
                                            <span style={{ fontSize: 13, fontWeight: 500, color: globalForm.is_pop ? '#A78BFA' : '#CBD5E1', display: 'flex', alignItems: 'center', gap: 6 }}>
                                                <MapPin size={16} /> Jadikan Aset Keluar untuk Keperluan POPs
                                            </span>
                                        </label>
                                        {globalForm.is_pop && (
                                            <div style={{ marginTop: 12 }} className="fade-in">
                                                <label style={{ fontSize: 12, color: '#A78BFA', display: 'block', marginBottom: 4 }}>Nama Lokasi / Point of Presence (POP) *</label>
                                                <input className="input" style={{ borderColor: '#8B5CF6' }} value={globalForm.lokasi_pop} onChange={e => setGlobalForm({ ...globalForm, lokasi_pop: e.target.value })} placeholder="Contoh: POP Jakarta Selatan 1" required={globalForm.is_pop} />
                                            </div>
                                        )}
                                    </div>

                                    <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
                                        <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={saving || cart.length === 0}>{saving ? 'Memproses...' : '🚀 Proses Checkout Barang'}</button>
                                        <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Batal</button>
                                    </div>
                                </form>
                            </div>
                        </div>
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
                                                <Link href={`/inventory/${item.barang.id_barang}`} style={{ display: 'block', color: '#60A5FA', fontWeight: 600, textDecoration: 'none' }} className="hover-underline">
                                                    {item.barang.nama_barang}
                                                </Link>
                                                <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace' }}>{item.barang.kode_barang}</div>
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
