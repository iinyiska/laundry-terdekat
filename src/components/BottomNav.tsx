'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Sparkles, MapPin, Zap, Clock, User, Gift } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function BottomNav() {
    const pathname = usePathname()
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    useEffect(() => {
        // Simple auth check
        supabase.auth.getUser().then(({ data: { user } }) => setUser(user))

        // Listen for changes (syncs with Login/Sidebar)
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
            setUser(session?.user || null)
        })

        return () => subscription.unsubscribe()
    }, [])

    // Don't show on admin or merchant pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/merchant')) {
        return null
    }

    // Helper for active state
    const isActive = (path: string) => pathname === path

    return (
        <nav className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto glass-bright py-3 px-6 flex justify-around items-center z-50 rounded-2xl shadow-xl backdrop-blur-md">
            <Link href="/" className={`flex flex-col items-center transition ${isActive('/') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                <Sparkles className="w-6 h-6" />
                <span className="text-[10px] mt-1 font-medium">Beranda</span>
            </Link>

            <Link href="/order" className={`flex flex-col items-center transition ${isActive('/order') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                <MapPin className="w-6 h-6" />
                <span className="text-[10px] mt-1">Cari</span>
            </Link>

            <Link href="/order" className="relative -mt-10 bg-gradient-to-br from-blue-500 to-purple-600 p-4 rounded-2xl shadow-lg shadow-blue-500/30 hover:scale-105 transition transform active:scale-95">
                <Zap className="w-7 h-7 text-white" />
            </Link>

            <Link href="/orders" className={`flex flex-col items-center transition ${isActive('/orders') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                <Clock className="w-6 h-6" />
                <span className="text-[10px] mt-1">Pesanan</span>
            </Link>

            {user ? (
                <Link href="/account" className={`flex flex-col items-center transition ${isActive('/account') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                    <User className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Akun</span>
                </Link>
            ) : (
                <Link href="/login" className={`flex flex-col items-center transition ${isActive('/login') ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}>
                    <Gift className="w-6 h-6" />
                    <span className="text-[10px] mt-1">Masuk</span>
                </Link>
            )}
        </nav>
    )
}
