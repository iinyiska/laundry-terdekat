'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, ShoppingBag, ClipboardList, User, Menu, X, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const navItems = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/order', label: 'Order Baru', icon: ShoppingBag },
    { href: '/orders', label: 'Pesanan Saya', icon: ClipboardList },
    { href: '/login', label: 'Akun', icon: User },
]

export default function SidebarMenu() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState<any>(null)
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        checkUser()
    }, [])

    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        setUser(null)
        setIsOpen(false)
        window.location.href = '/'
    }

    // Don't show on admin or merchant pages
    if (pathname?.startsWith('/admin') || pathname?.startsWith('/merchant')) {
        return null
    }

    return (
        <>
            {/* Hamburger Button - Fixed Top Left */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[60] p-3 rounded-xl glass-bright hover:bg-white/20 transition-all"
                aria-label="Toggle Menu"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <Menu className="w-6 h-6 text-white" />
                )}
            </button>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-[55] backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 h-full w-72 z-[58] transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="h-full glass-bright border-r border-white/10 flex flex-col">
                    {/* Header */}
                    <div className="p-6 pt-20 border-b border-white/10">
                        <h2 className="text-xl font-bold gradient-text">Laundry Terdekat</h2>
                        {user && (
                            <p className="text-sm text-gray-400 mt-1 truncate">{user.email}</p>
                        )}
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 py-4 overflow-y-auto">
                        {navItems.map((item) => {
                            // If logged in, change Akun to show Profile link
                            if (item.href === '/login' && user) {
                                return (
                                    <Link
                                        key="profile"
                                        href="/account"
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-4 px-6 py-4 text-gray-300 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <User className="w-5 h-5" />
                                        <span className="font-medium">Akun Saya</span>
                                    </Link>
                                )
                            }

                            const isActive = pathname === item.href ||
                                (item.href !== '/' && pathname?.startsWith(item.href))
                            const Icon = item.icon

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setIsOpen(false)}
                                    className={`flex items-center gap-4 px-6 py-4 transition-all ${isActive
                                        ? 'text-blue-400 bg-blue-500/10 border-r-2 border-blue-400'
                                        : 'text-gray-300 hover:bg-white/10 hover:text-white'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="font-medium">{item.label}</span>
                                </Link>
                            )
                        })}
                    </nav>

                    {/* Footer - Admin Link & Logout */}
                    <div className="p-4 border-t border-white/10 space-y-2">
                        <Link
                            href="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-4 px-4 py-3 text-gray-400 hover:bg-white/10 hover:text-white rounded-xl transition-all"
                        >
                            <Settings className="w-5 h-5" />
                            <span className="text-sm">Admin Panel</span>
                        </Link>

                        {user && (
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-4 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl transition-all w-full"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm">Logout</span>
                            </button>
                        )}
                    </div>
                </div>
            </aside>
        </>
    )
}
