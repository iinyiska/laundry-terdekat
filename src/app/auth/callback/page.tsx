'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle, ExternalLink } from 'lucide-react'

function AuthCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'manual'>('loading')
    const [message, setMessage] = useState('Memproses login...')
    const [tokens, setTokens] = useState<{ accessToken: string; refreshToken: string } | null>(null)
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

            // Check if we're in Capacitor in-app browser
            const isInAppBrowser = navigator.userAgent.includes('wv') ||
                navigator.userAgent.includes('WebView') ||
                document.referrer.includes('accounts.google.com')

            if (accessToken && refreshToken) {
                // Save tokens to localStorage so main app can read them
                localStorage.setItem('oauth_tokens', JSON.stringify({
                    access_token: accessToken,
                    refresh_token: refreshToken,
                    timestamp: Date.now()
                }))

                // Set session
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (error) {
                    throw error
                }

                setStatus('success')
                setMessage('Login berhasil!')
                setTokens({ accessToken, refreshToken })

                // If we're in a browser that might be in-app browser, show manual instruction
                if (typeof window !== 'undefined') {
                    // Try to close browser automatically (Capacitor)
                    try {
                        // This will work if we're in Capacitor context
                        if ((window as any).Capacitor?.Plugins?.Browser) {
                            await (window as any).Capacitor.Plugins.Browser.close()
                        }
                    } catch (e) {
                        // Can't close, show manual instruction
                    }

                    // Show manual close button after delay
                    setTimeout(() => {
                        setStatus('manual')
                        setMessage('Login berhasil! Silakan tutup tab ini.')
                    }, 1500)
                }
            } else {
                // No tokens in URL, check if we have tokens in localStorage
                const storedTokens = localStorage.getItem('oauth_tokens')
                if (storedTokens) {
                    const parsed = JSON.parse(storedTokens)
                    // Only use if recent (within 5 minutes)
                    if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
                        const { error } = await supabase.auth.setSession({
                            access_token: parsed.access_token,
                            refresh_token: parsed.refresh_token
                        })

                        if (!error) {
                            localStorage.removeItem('oauth_tokens')
                            setStatus('success')
                            setMessage('Login berhasil!')
                            setTimeout(() => router.push('/'), 1000)
                            return
                        }
                    }
                    localStorage.removeItem('oauth_tokens')
                }

                // Check if session already exists (normal OAuth flow)
                const { data: { session }, error } = await supabase.auth.getSession()

                if (session) {
                    setStatus('success')
                    setMessage('Login berhasil!')
                    setTimeout(() => router.push('/'), 1000)
                } else {
                    setMessage('Mengalihkan...')
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

    return (
        <main className="min-h-screen flex items-center justify-center px-4">
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" />
            </div>

            <div className="text-center max-w-md">
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
                        <p className="text-gray-400">
                            Kembali ke aplikasi dan refresh halaman untuk melanjutkan.
                        </p>
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => window.close()}
                                className="bg-green-500 text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 mx-auto hover:bg-green-600 transition"
                            >
                                <ExternalLink className="w-5 h-5" />
                                Tutup Tab Ini
                            </button>
                        </div>
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
