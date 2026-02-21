'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
    LayoutDashboard,
    Package,
    ArrowDownCircle,
    ArrowUpCircle,
    ClipboardList,
    ShoppingCart,
    Search,
    Database,
    Tags,
    Printer,
    Building2,
    Users,
    Warehouse,
} from 'lucide-react'

const menuGroups = [
    {
        label: 'Utama',
        items: [
            { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
            { href: '/inventory', label: 'Inventory', icon: Package },
            { href: '/laporan', label: 'Laporan', icon: Printer },
        ],
    },
    {
        label: 'Transaksi',
        items: [
            { href: '/masuk', label: 'Barang Masuk', icon: ArrowDownCircle },
            { href: '/keluar', label: 'Barang Keluar', icon: ArrowUpCircle },
        ],
    },
    {
        label: 'Pengadaan',
        items: [
            { href: '/request', label: 'Request Barang', icon: ClipboardList },
            { href: '/po', label: 'Purchase Order', icon: ShoppingCart },
        ],
    },
    {
        label: 'Asset',
        items: [
            { href: '/asset', label: 'Asset Tracking', icon: Search },
        ],
    },
    {
        label: 'Master Data',
        items: [
            { href: '/master/barang', label: 'Master Barang', icon: Database },
            { href: '/master/kategori', label: 'Kategori', icon: Tags },
            { href: '/master/cabang', label: 'Cabang & Area', icon: Building2 },
            { href: '/master/users', label: 'Users', icon: Users },
        ],
    },
]

export default function Sidebar() {
    const pathname = usePathname()

    return (
        <aside className="sidebar">
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: 'linear-gradient(135deg, #3B82F6, #6366F1)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Warehouse size={20} color="white" />
                    </div>
                    <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                            WMS
                        </div>
                        <div style={{ fontSize: 11, color: '#475569' }}>Warehouse Management</div>
                    </div>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuGroups.map((group) => (
                    <div key={group.label}>
                        <div className="nav-section-label">{group.label}</div>
                        {group.items.map((item) => {
                            const Icon = item.icon
                            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={`nav-item ${isActive ? 'active' : ''}`}
                                >
                                    <Icon className="icon" size={17} />
                                    {item.label}
                                </Link>
                            )
                        })}
                    </div>
                ))}
            </nav>

            <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ fontSize: 11, color: '#334155', textAlign: 'center' }}>
                    WMS v1.0.0 · wakhyu.hadi
                </div>
            </div>
        </aside>
    )
}
