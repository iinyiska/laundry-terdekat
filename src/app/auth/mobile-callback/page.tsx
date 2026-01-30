'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'

function MobileCallbackContent() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [message, setMessage] = useState('Memproses login...')
    const searchParams = useSearchParams()
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        handleTokens()
    }, [])

    const handleTokens = async () => {
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')

        if (accessToken && refreshToken) {
            try {
                const { error } = await supabase.auth.setSession({
                    access_token: accessToken,
                    refresh_token: refreshToken
                })

                if (error) {
                    setStatus('error')
                    setMessage('Gagal login: ' + error.message)
                    setTimeout(() => router.push('/login'), 2000)
                } else {
                    setStatus('success')
                    setMessage('Login berhasil!')
                    setTimeout(() => router.push('/'), 1500)
                }
            } catch (e: any) {
                setStatus('error')
                setMessage('Error: ' + e.message)
                setTimeout(() => router.push('/login'), 2000)
            }
        } else {
            setStatus('error')
            setMessage('Token tidak ditemukan')
            setTimeout(() => router.push('/login'), 2000)
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
                {status === 'success' && (
                    <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                )}
                {status === 'error' && (
                    <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                )}
                <p className="text-xl text-white font-medium">{message}</p>
            </div>
        </main>
    )
}

export default function MobileCallbackPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-16 h-16 animate-spin text-blue-400" />
            </main>
        }>
            <MobileCallbackContent />
        </Suspense>
    )
}
