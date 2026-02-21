import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
    return (
        <div style={{ display: 'flex' }}>
            <Sidebar />
            <main className="main-layout">
                {children}
            </main>
        </div>
    )
}
