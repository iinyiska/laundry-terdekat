'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export function useDeepLinkAuth() {
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        setupDeepLinkListener()
    }, [])

    const setupDeepLinkListener = async () => {
        // Check if we're in Capacitor
        if (typeof window === 'undefined') return
        if (!(window as any).Capacitor?.isNativePlatform?.()) return

        try {
            const { App } = await import('@capacitor/app')

            // Helper to handle URL
            const handleAuthUrl = async (urlString: string) => {
                const url = new URL(urlString.replace('laundryterdekat://', 'https://'))
                const accessToken = url.searchParams.get('access_token')
                const refreshToken = url.searchParams.get('refresh_token')

                if (accessToken && refreshToken) {
                    try {
                        const { error } = await supabase.auth.setSession({
                            access_token: accessToken,
                            refresh_token: refreshToken
                        })

                        if (!error) {
                            alert('Login Sukses! Halaman akan direfresh.')
                            window.location.reload()
                        } else {
                            alert('Login Gagal Set Session: ' + error.message)
                        }
                    } catch (e: any) {
                        alert('Error Logic Session: ' + e.message)
                    }
                }
            }

            // Listen for app URL open events (deep links)
            App.addListener('appUrlOpen', async (event) => {
                if (event.url.startsWith('laundryterdekat://auth')) {
                    await handleAuthUrl(event.url)
                }
            })

            // Also check initial URL when app opens
            const result = await App.getLaunchUrl()
            if (result?.url && result.url.startsWith('laundryterdekat://auth')) {
                await handleAuthUrl(result.url)
            }

        } catch (e) {
            console.error('Failed to setup deep link listener:', e)
        }
    }
}

// Component wrapper to use in layout
export default function DeepLinkAuthProvider({ children }: { children: React.ReactNode }) {
    useDeepLinkAuth()
    return <>{children}</>
}
