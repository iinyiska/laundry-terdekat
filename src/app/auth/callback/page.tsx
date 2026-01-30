'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle, Copy, ExternalLink, Check } from 'lucide-react'

function AuthCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading')
    const [message, setMessage] = useState('Memproses login...')
    const [deepLinkUrl, setDeepLinkUrl] = useState<string | null>(null)
    const [copied, setCopied] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        handleAuthCallback()
    }, [])

    const handleAuthCallback = async () => {
        try {
            // Check for hash params (OAuth returns tokens in hash)
            const hashParams = new URLSearchParams(window.location.hash.substring(1))
            const accessToken = hashParams.get('access_token')
            const refreshToken = hashParams.get('refresh_token')

            if (accessToken && refreshToken) {
                // Set session in this context
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (error) {
                    throw error
                }

                // Create deep link URL for Capacitor app
                const appDeepLink = `laundryterdekat://auth?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}`
                setDeepLinkUrl(appDeepLink)

                // Android intent URL (more reliable)
                const intentUrl = `intent://auth?access_token=${encodeURIComponent(accessToken)}&refresh_token=${encodeURIComponent(refreshToken)}#Intent;scheme=laundryterdekat;package=com.laundryterdekat.app;end`

                setStatus('success')
                setMessage('Login berhasil!')

                // Try to open deep link automatically
                setTimeout(() => {
                    // Try custom scheme first
                    window.location.href = appDeepLink

                    // After a short delay, try Android intent as fallback
                    setTimeout(() => {
                        // Check if still on this page (deep link didn't work)
                        if (document.hasFocus()) {
                            window.location.href = intentUrl
                        }
                    }, 800)

                    // After more delay, show manual instructions if still here
                    setTimeout(() => {
                        setStatus('manual')
                        setMessage('Kembali ke Aplikasi')
                    }, 2000)
                }, 500)
            } else {
                // Check if session already exists
                const { data: { session } } = await supabase.auth.getSession()

                if (session) {
                    setStatus('success')
                    setMessage('Login berhasil!')
                    setTimeout(() => router.push('/'), 1000)
                } else {
                    router.push('/login')
                }
            }
        } catch (err: any) {
            console.error('Auth callback error:', err)
            setStatus('error')
            setMessage(err.message || 'Terjadi kesalahan')
            setTimeout(() => router.push('/login'), 2000)
        }
    }

    const copyDeepLink = () => {
        if (deepLinkUrl) {
            navigator.clipboard.writeText(deepLinkUrl)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    const openApp = () => {
        if (deepLinkUrl) {
            window.location.href = deepLinkUrl
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            </div>

            <div className="text-center max-w-md w-full">
                {status === 'loading' && (
                    <Loader2 className="w-16 h-16 animate-spin text-blue-400 mx-auto mb-4" />
                )}
                {(status === 'success' || status === 'manual') && (
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                )}
                {status === 'error' && (
                    <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">❌</span>
                    </div>
                )}
                <p className="text-xl text-white font-medium mb-4">{message}</p>

                {status === 'manual' && (
                    <div className="space-y-4">
                        <p className="text-gray-400 text-sm">
                            Tekan tombol di bawah untuk kembali ke aplikasi, atau tutup tab ini dan buka aplikasi secara manual.
                        </p>

                        <button
                            onClick={openApp}
                            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 transition"
                        >
                            <ExternalLink className="w-5 h-5" />
                            Buka Aplikasi
                        </button>

                        <button
                            onClick={() => window.close()}
                            className="w-full bg-white/10 text-white font-medium py-3 px-6 rounded-xl hover:bg-white/20 transition"
                        >
                            Tutup Tab Ini
                        </button>

                        <p className="text-gray-500 text-xs mt-6">
                            Jika aplikasi tidak terbuka otomatis, tutup browser ini dan buka aplikasi Laundry Terdekat.
                        </p>
                    </div>
                )}

                {status === 'loading' && (
                    <p className="text-gray-400 mt-2">Mohon tunggu sebentar...</p>
                )}
            </div>
        </main>
    )
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-blue-400" />
            </main>
        }>
            <AuthCallbackContent />
        </Suspense>
    )
}
