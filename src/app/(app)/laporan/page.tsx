'use client'
import { useState } from 'react'
import { Printer, Download, FileSpreadsheet, Package, ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react'

export default function LaporanPage() {
    const [reportType, setReportType] = useState('inventory')

    // Default 1 month range
    const [startDate, setStartDate] = useState(() => {
        const d = new Date()
        d.setMonth(d.getMonth() - 1)
        return d.toISOString().split('T')[0]
    })
    const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0])

    const handleExport = (format: 'csv' | 'print') => {
        const query = `type=${reportType}&start=${startDate}&end=${endDate}`
        if (format === 'csv') {
            window.open(`/api/laporan/export?${query}`, '_blank')
        } else {
            window.open(`/laporan/print?${query}`, '_blank')
        }
    }

    const isDateRequired = reportType === 'masuk' || reportType === 'keluar'

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Printer size={22} color="#8B5CF6" /> Laporan & Eksport Data
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Cetak riwayat transaksi gudang atau unduh ke format Excel (CSV).</p>
                </div>
            </div>

            <div className="page-content" style={{ maxWidth: 800 }}>
                <div className="glass-card" style={{ padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 600, color: '#F1F5F9', marginBottom: 20 }}>Konfigurasi Laporan</h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                        {/* Report Type Selection */}
                        <div>
                            <label style={{ fontSize: 13, color: '#94A3B8', display: 'block', marginBottom: 12, fontWeight: 500 }}>Pilih Jenis Laporan</label>
                            <div className="grid-3" style={{ gap: 12 }}>
                                <div
                                    onClick={() => setReportType('inventory')}
                                    style={{ padding: 16, borderRadius: 12, cursor: 'pointer', border: `2px solid ${reportType === 'inventory' ? '#3B82F6' : 'rgba(255,255,255,0.05)'}`, background: reportType === 'inventory' ? 'rgba(59,130,246,0.1)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 8 }}
                                >
                                    <Package color={reportType === 'inventory' ? '#60A5FA' : '#64748B'} size={24} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: reportType === 'inventory' ? '#F1F5F9' : '#94A3B8' }}>Stok Gudang</div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Rekap seluruh stok barang saat ini.</div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setReportType('masuk')}
                                    style={{ padding: 16, borderRadius: 12, cursor: 'pointer', border: `2px solid ${reportType === 'masuk' ? '#10B981' : 'rgba(255,255,255,0.05)'}`, background: reportType === 'masuk' ? 'rgba(16,185,129,0.1)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 8 }}
                                >
                                    <ArrowDownCircle color={reportType === 'masuk' ? '#34D399' : '#64748B'} size={24} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: reportType === 'masuk' ? '#F1F5F9' : '#94A3B8' }}>Barang Masuk</div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Riwayat penerimaan berdasar tanggal.</div>
                                    </div>
                                </div>
                                <div
                                    onClick={() => setReportType('keluar')}
                                    style={{ padding: 16, borderRadius: 12, cursor: 'pointer', border: `2px solid ${reportType === 'keluar' ? '#EF4444' : 'rgba(255,255,255,0.05)'}`, background: reportType === 'keluar' ? 'rgba(239,68,68,0.1)' : 'transparent', display: 'flex', flexDirection: 'column', gap: 8 }}
                                >
                                    <ArrowUpCircle color={reportType === 'keluar' ? '#F87171' : '#64748B'} size={24} />
                                    <div>
                                        <div style={{ fontSize: 14, fontWeight: 600, color: reportType === 'keluar' ? '#F1F5F9' : '#94A3B8' }}>Barang Keluar</div>
                                        <div style={{ fontSize: 11, color: '#64748B', marginTop: 4 }}>Riwayat pengeluaran berdasar tanggal.</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Date Range Selection (Only for transactions) */}
                        {isDateRequired && (
                            <div className="fade-in">
                                <label style={{ fontSize: 13, color: '#94A3B8', display: 'block', marginBottom: 12, fontWeight: 500 }}>Periode Tanggal</label>
                                <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <Calendar size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input type="date" className="input" style={{ paddingLeft: 40 }} value={startDate} onChange={e => setStartDate(e.target.value)} />
                                    </div>
                                    <span style={{ color: '#64748B' }}>sampai</span>
                                    <div style={{ flex: 1, position: 'relative' }}>
                                        <Calendar size={16} color="#64748B" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }} />
                                        <input type="date" className="input" style={{ paddingLeft: 40 }} value={endDate} onChange={e => setEndDate(e.target.value)} />
                                    </div>
                                </div>
                            </div>
                        )}
                        {!isDateRequired && (
                            <div style={{ padding: 16, background: 'rgba(255,255,255,0.02)', borderRadius: 8, color: '#94A3B8', fontSize: 12 }}>
                                * Laporan Stok Gudang (Inventory) mencakup total stok seluruh barang secara real-time saat ini (tidak terikat periode tanggal).
                            </div>
                        )}

                        <hr style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '10px 0' }} />

                        {/* Action Buttons */}
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button className="btn btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', height: 48, fontSize: 15 }} onClick={() => handleExport('print')}>
                                <Printer size={18} /> Cetak Laporan (Print / PDF)
                            </button>
                            <button className="btn btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', height: 48, fontSize: 15, background: 'rgba(16,185,129,0.1)', color: '#34D399', borderColor: 'rgba(16,185,129,0.2)' }} onClick={() => handleExport('csv')}>
                                <FileSpreadsheet size={18} /> Export Excel (CSV)
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
