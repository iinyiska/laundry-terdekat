'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ClipboardList, User } from 'lucide-react'

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/order', label: 'Order', icon: Search },
    { href: '/orders', label: 'Pesanan', icon: ClipboardList },
    { href: '/login', label: 'Akun', icon: User },
]

export default function BottomNav() {
    const pathname = usePathname()

    // Don't show on admin or merchant pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/merchant')) {
        return null
    }

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 glass-bright border-t border-white/10 safe-area-bottom">
            <div className="max-w-2xl mx-auto px-4">
                <div className="flex justify-around items-center py-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href ||
                            (item.href !== '/' && pathname?.startsWith(item.href))
                        const Icon = item.icon

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex flex-col items-center gap-1 px-4 py-2 rounded-xl transition-all ${isActive
                                        ? 'text-blue-400 bg-blue-500/20'
                                        : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                <Icon className="w-5 h-5" />
                                <span className="text-xs font-medium">{item.label}</span>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </nav>
    )
}
