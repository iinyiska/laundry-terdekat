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

            // Listen for app URL open events (deep links)
            App.addListener('appUrlOpen', async (event) => {
                console.log('Deep link received:', event.url)

                // Parse the deep link URL
                if (event.url.startsWith('laundryterdekat://auth')) {
                    const url = new URL(event.url.replace('laundryterdekat://', 'https://'))
                    const accessToken = url.searchParams.get('access_token')
                    const refreshToken = url.searchParams.get('refresh_token')

                    if (accessToken && refreshToken) {
                        try {
                            // Set the session with tokens from deep link
                            const { error } = await supabase.auth.setSession({
                                access_token: decodeURIComponent(accessToken),
                                refresh_token: decodeURIComponent(refreshToken)
                            })

                            if (!error) {
                                console.log('Session set successfully from deep link')
                                // Refresh the page to show logged in state
                                window.location.reload()
                            } else {
                                console.error('Failed to set session:', error)
                            }
                        } catch (e) {
                            console.error('Error setting session from deep link:', e)
                        }
                    }
                }
            })

            // Also check initial URL when app opens
            const result = await App.getLaunchUrl()
            if (result?.url && result.url.startsWith('laundryterdekat://auth')) {
                const url = new URL(result.url.replace('laundryterdekat://', 'https://'))
                const accessToken = url.searchParams.get('access_token')
                const refreshToken = url.searchParams.get('refresh_token')

                if (accessToken && refreshToken) {
                    const { error } = await supabase.auth.setSession({
                        access_token: decodeURIComponent(accessToken),
                        refresh_token: decodeURIComponent(refreshToken)
                    })

                    if (!error) {
                        console.log('Session set from launch URL')
                        window.location.reload()
                    }
                }
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
