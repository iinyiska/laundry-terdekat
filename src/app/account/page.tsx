'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { User, Mail, Phone, MapPin, Save, Loader2, LogOut, ChevronLeft, CheckCircle } from 'lucide-react'

type UserProfile = {
    id: string
    email: string
    full_name: string | null
    phone: string | null
    address: string | null
    avatar_url: string | null
}

export default function AccountPage() {
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<UserProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form fields
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [address, setAddress] = useState('')

    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        loadUserData()
    }, [])

    const loadUserData = async () => {
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            router.push('/login')
            return
        }

        setUser(user)

        // Load profile from profiles table
        const { data: profileData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        if (profileData) {
            setProfile(profileData)
            setFullName(profileData.full_name || user.user_metadata?.full_name || '')
            setPhone(profileData.phone || '')
            setAddress(profileData.address || '')
        } else {
            // Create profile if doesn't exist
            setFullName(user.user_metadata?.full_name || user.email?.split('@')[0] || '')
        }

        setLoading(false)
    }

    const handleSave = async () => {
        if (!user) return

        setSaving(true)
        setError(null)
        setSuccess(false)

        try {
            // Upsert profile
            const { error: upsertError } = await supabase
                .from('profiles')
                .upsert({
                    id: user.id,
                    full_name: fullName,
                    phone: phone,
                    address: address,
                    email: user.email,
                    updated_at: new Date().toISOString()
                })

            if (upsertError) throw upsertError

            setSuccess(true)
            setTimeout(() => setSuccess(false), 3000)
        } catch (err: any) {
            setError(err.message || 'Gagal menyimpan')
        }

        setSaving(false)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>
                <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-8">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 ml-10">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-white">Akun Saya</h1>
                        <p className="text-xs text-gray-400">{user?.email}</p>
                    </div>
                </div>
            </header>

            <div className="px-4 max-w-2xl mx-auto py-6 space-y-6">
                {/* Avatar & Email */}
                <div className="glass p-6 text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center overflow-hidden">
                        {user?.user_metadata?.avatar_url ? (
                            <img src={user.user_metadata.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-10 h-10 text-white" />
                        )}
                    </div>
                    <h2 className="text-xl font-bold text-white">{fullName || 'Pengguna'}</h2>
                    <p className="text-gray-400 text-sm">{user?.email}</p>
                    <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
                        <CheckCircle className="w-3 h-3" />
                        Terverifikasi
                    </div>
                </div>

                {/* Edit Profile Form */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4">Detail Akun</h3>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/20 border border-green-500/30 text-green-300 p-3 rounded-xl mb-4 text-sm flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Berhasil disimpan!
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Nama Lengkap</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="text"
                                    className="input-glass w-full pl-12"
                                    placeholder="Nama lengkap"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    className="input-glass w-full pl-12 opacity-50"
                                    value={user?.email || ''}
                                    disabled
                                />
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Email tidak bisa diubah</p>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Nomor WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="tel"
                                    className="input-glass w-full pl-12"
                                    placeholder="08xxxxxxxxxx"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400 mb-2 block">Alamat Default</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-4 w-5 h-5 text-gray-500" />
                                <textarea
                                    className="input-glass w-full pl-12"
                                    rows={3}
                                    placeholder="Alamat lengkap untuk penjemputan"
                                    value={address}
                                    onChange={(e) => setAddress(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="btn-gradient w-full py-4 flex items-center justify-center gap-2"
                        >
                            {saving ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    Simpan Perubahan
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4">Menu Lainnya</h3>
                    <div className="space-y-2">
                        <Link href="/orders" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
                            <span className="text-white">Riwayat Pesanan</span>
                            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
                        </Link>
                        <Link href="/order" className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
                            <span className="text-white">Order Baru</span>
                            <ChevronLeft className="w-5 h-5 rotate-180 text-gray-400" />
                        </Link>
                    </div>
                </div>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="w-full py-4 rounded-xl bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Keluar dari Akun
                </button>
            </div>
        </main>
    )
}
