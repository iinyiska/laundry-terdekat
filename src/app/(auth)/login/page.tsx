'use client'

import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, Sparkles, ArrowLeft, Mail, Lock } from 'lucide-react'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const router = useRouter()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            setError(error.message)
            setLoading(false)
        } else {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role === 'merchant') {
                    router.push('/merchant/dashboard')
                } else {
                    router.push('/')
                }
            }
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
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
                        <h2 className="text-2xl font-bold text-white">Selamat Datang Kembali</h2>
                        <p className="text-gray-400 mt-2">Masuk untuk akses penuh</p>
                    </div>

                    {error && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleLogin} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="email"
                                    required
                                    className="input-glass w-full pl-12"
                                    placeholder="nama@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input
                                    type="password"
                                    required
                                    className="input-glass w-full pl-12"
                                    placeholder="******"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gradient w-full text-lg py-4 flex justify-center items-center mt-6"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : 'Masuk'}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-gray-400">
                        Belum punya akun?{' '}
                        <Link href="/register" className="text-blue-400 font-semibold hover:underline">
                            Daftar & Dapat Diskon 20%
                        </Link>
                    </p>
                </div>
            </div>
        </main>
    )
}
