import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

export function formatDate(date: Date | string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    }).format(new Date(date))
}

export function formatDateShort(date: Date | string): string {
    return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(new Date(date))
}

export function getStokStatus(stok: number, stokMin: number = 5): 'aman' | 'menipis' | 'habis' {
    if (stok <= 0) return 'habis'
    if (stok <= stokMin) return 'menipis'
    return 'aman'
}

export function getStokBadgeColor(status: 'aman' | 'menipis' | 'habis'): string {
    switch (status) {
        case 'aman': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'menipis': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        case 'habis': return 'bg-red-500/20 text-red-400 border-red-500/30'
    }
}

export function getStatusBadgeColor(status: string): string {
    switch (status?.toLowerCase()) {
        case 'draft': return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
        case 'diajukan': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'disetujui': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'ditolak': return 'bg-red-500/20 text-red-400 border-red-500/30'
        case 'pending': return 'bg-amber-500/20 text-amber-400 border-amber-500/30'
        case 'selesai': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
        case 'gudang': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
        case 'deployed': return 'bg-purple-500/20 text-purple-400 border-purple-500/30'
        case 'rusak': return 'bg-red-500/20 text-red-400 border-red-500/30'
        default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
    }
}
