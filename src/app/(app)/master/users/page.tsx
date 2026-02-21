'use client'
import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2 } from 'lucide-react'

interface User {
    id_user: number;
    username: string;
    nama: string;
    telepon: string | null;
    level: string;
    jabatan: string | null;
    status_aktif: number;
}

export default function MasterUsersPage() {
    const [items, setItems] = useState<User[]>([])
    const [loading, setLoading] = useState(true)

    // Modal
    const [showModal, setShowModal] = useState(false)
    const [editId, setEditId] = useState<number | null>(null)
    const [formData, setFormData] = useState({
        username: '', password: '', nama: '', telepon: '', level: 'staff', jabatan: '', status_aktif: '1'
    })

    const loadData = () => {
        setLoading(true)
        fetch('/api/user').then(r => r.json()).then(d => {
            setItems(d.items || []); setLoading(false)
        })
    }

    useEffect(() => { loadData() }, [])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        const method = editId ? 'PUT' : 'POST'
        const url = editId ? `/api/user/${editId}` : '/api/user'

        await fetch(url, {
            method, headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        setShowModal(false); setEditId(null); loadData()
    }

    const handleDelete = async (id: number) => {
        if (!confirm('Hapus user ini?')) return
        await fetch(`/api/user/${id}`, { method: 'DELETE' })
        loadData()
    }

    const openEdit = (u: User) => {
        setFormData({
            username: u.username, password: '', // don't load password
            nama: u.nama, telepon: u.telepon || '',
            level: u.level, jabatan: u.jabatan || '',
            status_aktif: u.status_aktif.toString()
        })
        setEditId(u.id_user)
        setShowModal(true)
    }

    return (
        <div className="fade-in">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: 20, fontWeight: 700, color: '#F1F5F9', display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Users size={22} color="#8B5CF6" /> User Management
                    </h1>
                    <p style={{ fontSize: 13, color: '#64748B', marginTop: 2 }}>Kelola daftar staf dan hak akses aplikasi</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => { setEditId(null); setFormData({ username: '', password: '', nama: '', telepon: '', level: 'staff', jabatan: '', status_aktif: '1' }); setShowModal(true) }}>
                    <Plus size={15} /> Tambah User
                </button>
            </div>

            <div className="page-content">
                <div className="data-table-container">
                    {loading ? <div style={{ padding: 48, textAlign: 'center', color: '#64748B' }}>Memuat data...</div> :
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Username</th>
                                    <th>Nama Lengkap</th>
                                    <th>Role / Level</th>
                                    <th>Status</th>
                                    <th>Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map(u => (
                                    <tr key={u.id_user}>
                                        <td style={{ fontWeight: 500, color: '#F1F5F9' }}>{u.username}</td>
                                        <td>{u.nama}</td>
                                        <td><span style={{ fontSize: 11, background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: 4 }}>{u.level}</span></td>
                                        <td>
                                            {u.status_aktif === 1 ?
                                                <span style={{ color: '#10B981', fontSize: 12 }}>Aktif</span> :
                                                <span style={{ color: '#EF4444', fontSize: 12 }}>Nonaktif</span>
                                            }
                                        </td>
                                        <td style={{ display: 'flex', gap: 8 }}>
                                            <button className="btn btn-secondary btn-sm" onClick={() => openEdit(u)} style={{ padding: 6 }}><Edit size={14} /></button>
                                            <button className="btn btn-secondary btn-sm" onClick={() => handleDelete(u.id_user)} style={{ padding: 6, color: '#EF4444' }}><Trash2 size={14} /></button>
                                        </td>
                                    </tr>
                                ))}
                                {items.length === 0 && <tr><td colSpan={5} style={{ textAlign: 'center', color: '#64748B' }}>Tidak ada user ditemukan.</td></tr>}
                            </tbody>
                        </table>
                    }
                </div>
            </div>

            {showModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
                    <div style={{ background: '#0F172A', border: '1px solid #1E293B', borderRadius: 12, width: 450, padding: 24 }}>
                        <h2 style={{ fontSize: 18, color: '#F1F5F9', marginBottom: 16 }}>{editId ? 'Edit User' : 'Tambah User'}</h2>
                        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Username</label>
                                    <input required className="form-input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Password {editId && <span style={{ fontSize: 10, color: '#64748B' }}>(Kosongkan jika tdk diubah)</span>}</label>
                                    <input type="password" required={!editId} className="form-input" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Nama Lengkap</label>
                                <input required className="form-input" value={formData.nama} onChange={e => setFormData({ ...formData, nama: e.target.value })} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Level / Role</label>
                                    <select className="form-input" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                                        <option value="administrator">Administrator</option>
                                        <option value="staff">Staff Gudang</option>
                                        <option value="manager">Manager</option>
                                    </select>
                                </div>
                                <div>
                                    <label style={{ fontSize: 12, color: '#94A3B8', display: 'block', marginBottom: 4 }}>Status Aktif</label>
                                    <select className="form-input" value={formData.status_aktif} onChange={e => setFormData({ ...formData, status_aktif: e.target.value })}>
                                        <option value="1">Aktif</option>
                                        <option value="0">Nonaktif</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 }}>
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                                <button type="submit" className="btn btn-primary">Simpan</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
