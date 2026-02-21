'use client'

import { useEffect, useState } from 'react'
import {
    Package, TrendingUp, TrendingDown, AlertTriangle,
    ArrowDownCircle, ArrowUpCircle, RefreshCw, BarChart3
} from 'lucide-react'
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { formatDate } from '@/lib/utils'

interface DashboardStats {
    totalBarang: number
    totalStok: number
    stokMenipis: number
    barangRusak: number
    masukBulanIni: number
    keluarBulanIni: number
    recentMasuk: Array<{ id_masuk: number; jumlah: number; tgl_masuk: string; barang: { nama_barang: string; kode_barang: string } }>
    recentKeluar: Array<{ id_keluar: number; jumlah: number; tgl_keluar: string; barang: { nama_barang: string; kode_barang: string } }>
    stokKategori: Array<{ kategori: string; jumlahItem: number; totalStok: number }>
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#EC4899', '#14B8A6']

const statCards = [
    { key: 'totalBarang', label: 'Total Item Barang', icon: Package, color: '#3B82F6', bg: 'rgba(59,130,246,0.1)' },
    { key: 'totalStok', label: 'Total Unit Stok', icon: BarChart3, color: '#10B981', bg: 'rgba(16,185,129,0.1)' },
    { key: 'stokMenipis', label: 'Stok Menipis', icon: AlertTriangle, color: '#F59E0B', bg: 'rgba(245,158,11,0.1)' },
    { key: 'barangRusak', label: 'Barang Rusak', icon: TrendingDown, color: '#EF4444', bg: 'rgba(239,68,68,0.1)' },
]

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const fetchStats = async () => {
        try {
            setLoading(true)
            const res = await fetch('/api/dashboard/stats')
            if (!res.ok) throw new Error('Gagal memuat data')
            const data = await res.json()
            setStats(data)
            setError(null)
        } catch (e) {
            setError('Koneksi database gagal. Pastikan MySQL sudah running dan database sudah diimport.')
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStats() }, [])

    if (loading) return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', border: '3px solid rgba(59,130,246,0.2)', borderTopColor: '#3B82F6', animation: 'spin 1s linear infinite' }} />
            <p style={{ color: '#94A3B8' }}>Memuat data dashboard...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    )

    if (error) return (
        <div className="page-content fade-in">
            <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 12, padding: '24px', maxWidth: 600 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                    <AlertTriangle color="#EF4444" size={24} />
                    <h3 style={{ color: '#F87171', fontWeight: 600 }}>Koneksi Database Gagal</h3>
                </div>
                <p style={{ color: '#94A3B8', fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{error}</p>
                <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: 8, padding: '12px 16px', fontFamily: 'monospace', fontSize: 13, color: '#60A5FA' }}>
                    <div>1. Buka MySQL Workbench / Command Prompt</div>
                    <div>2. Import file: <span style={{ color: '#34D399' }}>wakhyu.hadi_warehouse.sql</span></div>
                    <div>3. Update <span style={{ color: '#34D399' }}>.env</span> → DATABASE_URL</div>
                    <div>4. Jalankan: <span style={{ color: '#34D399' }}>npx prisma db push</span></div>
                </div>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={fetchStats}>
                    <RefreshCw size={15} /> Coba Lagi
                </button>
            </div>
        </div>
    )

    return (
        <div className="fade-in">
            <div className="page-header">
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9' }}>Dashboard</h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Overview sistem manajemen gudang</p>
                </div>
                <button className="btn btn-secondary btn-sm" onClick={fetchStats}>
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            <div className="page-content">
                {/* KPI Cards */}
                <div className="grid-4" style={{ marginBottom: 24 }}>
                    {statCards.map((card) => {
                        const Icon = card.icon
                        const value = stats ? (stats as never)[card.key] : 0
                        return (
                            <div key={card.key} className="stat-card">
                                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 }}>
                                    <div className="stat-icon" style={{ background: card.bg }}>
                                        <Icon size={20} color={card.color} />
                                    </div>
                                    <div style={{ fontSize: 11, color: '#64748B', padding: '3px 8px', background: 'rgba(255,255,255,0.04)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
                                        Live
                                    </div>
                                </div>
                                <div className="stat-value" style={{ color: card.color, marginBottom: 4 }}>
                                    {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
                                </div>
                                <div className="stat-label">{card.label}</div>
                            </div>
                        )
                    })}
                </div>

                {/* Transaksi Bulan Ini */}
                <div className="grid-2" style={{ marginBottom: 24 }}>
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.15)', width: 56, height: 56, borderRadius: 14 }}>
                            <ArrowDownCircle size={24} color="#10B981" />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Masuk Bulan Ini</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#10B981' }}>{stats?.masukBulanIni ?? 0}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>transaksi</div>
                        </div>
                    </div>
                    <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                        <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.15)', width: 56, height: 56, borderRadius: 14 }}>
                            <ArrowUpCircle size={24} color="#EF4444" />
                        </div>
                        <div>
                            <div style={{ fontSize: 11, color: '#64748B', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 600 }}>Keluar Bulan Ini</div>
                            <div style={{ fontSize: 32, fontWeight: 700, color: '#EF4444' }}>{stats?.keluarBulanIni ?? 0}</div>
                            <div style={{ fontSize: 12, color: '#64748B' }}>transaksi</div>
                        </div>
                    </div>
                </div>

                {/* Charts */}
                <div className="grid-2" style={{ marginBottom: 24 }}>
                    {/* Stok per Kategori Bar Chart */}
                    <div className="chart-container">
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Stok per Kategori</h3>
                        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Total unit stok berdasarkan kategori</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <BarChart data={stats?.stokKategori?.slice(0, 8)} margin={{ top: 5, right: 10, bottom: 40, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="kategori" tick={{ fill: '#64748B', fontSize: 10 }} angle={-35} textAnchor="end" />
                                <YAxis tick={{ fill: '#64748B', fontSize: 11 }} />
                                <Tooltip
                                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
                                    labelStyle={{ color: '#94A3B8' }}
                                />
                                <Bar dataKey="totalStok" fill="#3B82F6" radius={[4, 4, 0, 0]} name="Total Stok" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Pie Chart - Distribusi Item */}
                    <div className="chart-container">
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 4 }}>Distribusi Item</h3>
                        <p style={{ fontSize: 12, color: '#64748B', marginBottom: 16 }}>Jumlah jenis barang per kategori</p>
                        <ResponsiveContainer width="100%" height={240}>
                            <PieChart>
                                <Pie
                                    data={stats?.stokKategori?.slice(0, 8)}
                                    cx="50%" cy="50%"
                                    innerRadius={60} outerRadius={90}
                                    dataKey="jumlahItem"
                                    nameKey="kategori"
                                    paddingAngle={3}
                                >
                                    {stats?.stokKategori?.slice(0, 8).map((_, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ background: '#1E293B', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#F1F5F9' }}
                                    formatter={(value, name) => [value + ' item', name]}
                                />
                                <Legend
                                    formatter={(value) => <span style={{ color: '#94A3B8', fontSize: 11 }}>{value}</span>}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Transactions */}
                <div className="grid-2">
                    {/* Recent Masuk */}
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ArrowDownCircle size={16} color="#10B981" /> Barang Masuk Terbaru
                            </span>
                        </h3>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Barang</th>
                                        <th>Jumlah</th>
                                        <th>Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentMasuk?.length === 0 ? (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#475569', padding: 24 }}>Belum ada data</td></tr>
                                    ) : stats?.recentMasuk?.map((item) => (
                                        <tr key={item.id_masuk}>
                                            <td>
                                                <div style={{ color: '#F1F5F9', fontWeight: 500, fontSize: 13 }}>{item.barang.nama_barang.substring(0, 30)}{item.barang.nama_barang.length > 30 ? '...' : ''}</div>
                                                <div style={{ color: '#475569', fontSize: 11 }}>{item.barang.kode_barang}</div>
                                            </td>
                                            <td><span style={{ color: '#10B981', fontWeight: 600 }}>+{item.jumlah}</span></td>
                                            <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_masuk)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Recent Keluar */}
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#F1F5F9', marginBottom: 12 }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <ArrowUpCircle size={16} color="#EF4444" /> Barang Keluar Terbaru
                            </span>
                        </h3>
                        <div className="data-table-container">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Barang</th>
                                        <th>Jumlah</th>
                                        <th>Tanggal</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats?.recentKeluar?.length === 0 ? (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#475569', padding: 24 }}>Belum ada data</td></tr>
                                    ) : stats?.recentKeluar?.map((item) => (
                                        <tr key={item.id_keluar}>
                                            <td>
                                                <div style={{ color: '#F1F5F9', fontWeight: 500, fontSize: 13 }}>{item.barang.nama_barang.substring(0, 30)}{item.barang.nama_barang.length > 30 ? '...' : ''}</div>
                                                <div style={{ color: '#475569', fontSize: 11 }}>{item.barang.kode_barang}</div>
                                            </td>
                                            <td><span style={{ color: '#EF4444', fontWeight: 600 }}>-{item.jumlah}</span></td>
                                            <td style={{ fontSize: 12, color: '#64748B' }}>{formatDate(item.tgl_keluar)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
