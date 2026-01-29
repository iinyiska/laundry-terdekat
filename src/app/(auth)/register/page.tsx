'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { Gift, ArrowRight, User, Mail, Lock, Eye, EyeOff, CheckCircle, Sparkles, ChevronLeft } from 'lucide-react'

export default function RegisterPage() {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        try {
            const { error: signUpError } = await supabase.auth.signUp({
                email: formData.email,
                password: formData.password,
                options: {
                    data: { full_name: formData.name }
                }
            })

            if (signUpError) throw signUpError
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignIn = async () => {
        setLoading(true)
        setError(null)
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/auth/callback`
                }
            })
            if (error) throw error
        } catch (err: any) {
            setError(err.message || 'Google login gagal')
            setLoading(false)
        }
    }

    if (success) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="fixed inset-0 -z-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
                </div>
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center floating">
                        <CheckCircle className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Pendaftaran Berhasil! 🎉</h2>
                    <p className="text-gray-400 mb-6">
                        Silahkan cek email untuk verifikasi akun. Setelah itu kamu bisa langsung order dengan diskon 20%!
                    </p>
                    <Link href="/order" className="btn-gradient inline-flex items-center gap-2">
                        <Gift className="w-5 h-5" />
                        Order Sekarang
                    </Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4 py-8">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" />
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg">Laundry Terdekat</span>
                    </div>
                </div>

                {/* Promo Banner */}
                <div className="glass p-5 mb-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-400/30 to-orange-500/30 rounded-full blur-2xl"></div>
                    <div className="relative flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                            <Gift className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-lg text-white">Diskon 20% Member!</h3>
                            <p className="text-sm text-gray-400">Daftar dan dapatkan potongan langsung</p>
                        </div>
                    </div>
                </div>

                {/* Register Form */}
                <div className="glass p-8">
                    <h2 className="text-2xl font-bold text-white mb-2">Daftar Gratis</h2>
                    <p className="text-gray-400 mb-6">Buat akun untuk menikmati diskon member</p>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Google Sign In */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 py-4 px-6 rounded-xl border border-white/20 bg-white/5 hover:bg-white/10 transition mb-6"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        <span className="font-medium text-white">Daftar dengan Google</span>
                    </button>

                    <div className="relative mb-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-white/10"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-slate-800 text-gray-400">atau daftar manual</span>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="text"
                                className="input-glass w-full pl-12"
                                placeholder="Nama Lengkap"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="email"
                                className="input-glass w-full pl-12"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                className="input-glass w-full pl-12 pr-12"
                                placeholder="Password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500"
                            >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full py-4 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <span className="animate-pulse">Loading...</span>
                            ) : (
                                <>
                                    Daftar Sekarang
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                    <p className="text-center text-gray-400 mt-6 text-sm">
                        Sudah punya akun?{' '}
                        <Link href="/login" className="text-blue-400 hover:underline font-medium">
                            Masuk
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
