'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Gift, Sparkles, Check, ArrowLeft } from 'lucide-react'

export default function RegisterPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [fullName, setFullName] = useState('')
    const [phone, setPhone] = useState('')
    const [role, setRole] = useState<'customer' | 'merchant'>('customer')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { data, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                }
            }
        })

        if (signUpError) {
            setError(signUpError.message)
            setLoading(false)
            return
        }

        if (data.user) {
            const { error: profileError } = await supabase
                .from('profiles')
                .insert({
                    id: data.user.id,
                    email: email,
                    full_name: fullName,
                    phone: phone,
                    role: role
                })

            if (profileError) {
                console.error('Profile creation failed:', profileError)
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/login')
            }, 2000)
        }
        setLoading(false)
    }

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Check className="w-10 h-10 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Registrasi Berhasil! 🎉</h2>
                    <p className="text-gray-400 mb-4">Kamu dapat diskon 20% untuk pesanan pertama</p>
                    <div className="animate-pulse text-blue-400">Mengalihkan ke halaman login...</div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Back Button */}
                <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition">
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </Link>

                <div className="glass p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-2">Daftar & Dapat Diskon</h2>
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-full px-4 py-2">
                            <Gift className="w-4 h-4 text-yellow-400" />
                            <span className="text-sm font-semibold text-yellow-300">Diskon 20% Pesanan Pertama!</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Nama Lengkap</label>
                            <input
                                type="text"
                                required
                                className="input-glass w-full"
                                placeholder="John Doe"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <input
                                type="email"
                                required
                                className="input-glass w-full"
                                placeholder="nama@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">No. HP (WhatsApp)</label>
                            <input
                                type="tel"
                                className="input-glass w-full"
                                placeholder="08xxxxxxxxxx"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <input
                                type="password"
                                required
                                minLength={6}
                                className="input-glass w-full"
                                placeholder="Min. 6 karakter"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-3">Daftar Sebagai</label>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => setRole('customer')}
                                    className={`p-4 rounded-xl border-2 font-medium transition text-center ${role === 'customer'
                                            ? 'border-blue-500 bg-blue-500/20 text-blue-300'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    👤 Pelanggan
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setRole('merchant')}
                                    className={`p-4 rounded-xl border-2 font-medium transition text-center ${role === 'merchant'
                                            ? 'border-purple-500 bg-purple-500/20 text-purple-300'
                                            : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                        }`}
                                >
                                    🏪 Mitra Laundry
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full text-lg py-4 flex justify-center items-center gap-2 mt-6"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : (
                                <>
                                    <Gift className="w-5 h-5" />
                                    Daftar & Klaim Diskon
                                </>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-blue-400 font-semibold hover:underline">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
