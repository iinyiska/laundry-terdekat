'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Package, DollarSign, Clock, TrendingUp, ChevronRight, Sparkles, Settings, LogOut, ClipboardList, CheckCircle, RefreshCw, Home, User, BarChart3, Bell, Phone, MapPin, Star, Truck, Shirt, Calendar, FileText, MessageCircle } from 'lucide-react'
import Link from 'next/link'

type Order = {
    id: string
    order_number: string
    status: string
    total: number
    created_at: string
    customer_name: string
    customer_whatsapp: string
    pickup_address: string
    notes?: string
    service_speed: string
    order_type: string
    weight_kg?: number
}

type Profile = {
    id: string
    email: string
    full_name: string
    phone?: string
    role: string
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Menunggu', color: 'bg-yellow-500', icon: Clock },
    { value: 'confirmed', label: 'Dikonfirmasi', color: 'bg-blue-500', icon: CheckCircle },
    { value: 'pickup', label: 'Dijemput', color: 'bg-cyan-500', icon: Truck },
    { value: 'washing', label: 'Dicuci', color: 'bg-blue-400', icon: Shirt },
    { value: 'drying', label: 'Dikeringkan', color: 'bg-orange-500', icon: RefreshCw },
    { value: 'ironing', label: 'Disetrika', color: 'bg-purple-500', icon: Shirt },
    { value: 'ready', label: 'Siap Antar', color: 'bg-green-400', icon: Package },
    { value: 'delivery', label: 'Diantar', color: 'bg-cyan-400', icon: Truck },
    { value: 'completed', label: 'Selesai', color: 'bg-green-500', icon: CheckCircle },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-500', icon: Clock },
]

const MENU_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'orders', label: 'Pesanan', icon: ClipboardList },
    { id: 'stats', label: 'Statistik', icon: BarChart3 },
    { id: 'profile', label: 'Profil', icon: User },
]

export default function MerchantDashboard() {
    const [activeMenu, setActiveMenu] = useState('dashboard')
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [profile, setProfile] = useState<Profile | null>(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const [notification, setNotification] = useState('')
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user)
            // Load profile
            const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
            if (profileData) setProfile(profileData)

            // Check if merchant
            if (profileData?.role !== 'merchant' && profileData?.role !== 'admin') {
                setNotification('Akun ini bukan Merchant. Hubungi Admin untuk upgrade.')
            }

            fetchOrders(user.id)

            // Realtime subscription for orders
            const subscription = supabase
                .channel('merchant_orders')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${user.id}` }, () => fetchOrders(user.id))
                .subscribe()

            return () => { subscription.unsubscribe() }
        } else {
            setLoading(false)
            window.location.href = '/login'
        }
    }

    const fetchOrders = async (userId: string) => {
        setLoading(true)
        console.log('[Merchant] Fetching orders for', userId)
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_id', userId)
            .order('created_at', { ascending: false })

        if (error) console.error('[Merchant] Orders error:', error)
        if (data) {
            console.log('[Merchant] Orders loaded:', data.length)
            setOrders(data)
        }
        setLoading(false)
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        console.log('[Merchant] Updating order', orderId, 'to', newStatus)
        try {
            const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
            if (error) throw error
            await supabase.from('order_status_history').insert({ order_id: orderId, status: newStatus, notes: 'Merchant Update' })
            fetchOrders(user.id)
            setNotification(`Status diubah ke ${STATUS_OPTIONS.find(s => s.value === newStatus)?.label}`)
            setTimeout(() => setNotification(''), 3000)
        } catch (error: any) {
            console.error('[Merchant] Error updating status:', error)
            setNotification(`Error: ${error.message}`)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    // Stats calculations
    const getTotalRevenue = () => orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)
    const getActiveOrders = () => orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length
    const getCompletedOrders = () => orders.filter(o => o.status === 'completed').length
    const getTodayOrders = () => orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString()).length
    const getAverageOrder = () => getCompletedOrders() > 0 ? getTotalRevenue() / getCompletedOrders() : 0

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

    if (!user && loading) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-400">Memuat...</p>
                </div>
            </main>
        )
    }

    if (!user) return null

    return (
        <main className="min-h-screen pb-24">
            {/* Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Notification */}
            {notification && (
                <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium shadow-xl animate-bounce">
                    {notification}
                </div>
            )}

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">Merchant Panel</h1>
                            <p className="text-xs text-gray-400">{profile?.full_name || user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition text-gray-400 relative">
                            <Bell className="w-5 h-5" />
                            {getActiveOrders() > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{getActiveOrders()}</span>
                            )}
                        </button>
                        <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition text-red-400">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 max-w-4xl mx-auto">
                {/* Dashboard View */}
                {activeMenu === 'dashboard' && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            {[
                                { label: 'Pesanan Aktif', value: getActiveOrders(), icon: Package, color: 'from-blue-500 to-cyan-400' },
                                { label: 'Selesai', value: getCompletedOrders(), icon: CheckCircle, color: 'from-green-500 to-emerald-400' },
                                { label: 'Pendapatan', value: `Rp ${(getTotalRevenue() / 1000).toFixed(0)}k`, icon: DollarSign, color: 'from-purple-500 to-pink-400' },
                                { label: 'Hari Ini', value: getTodayOrders(), icon: Calendar, color: 'from-yellow-500 to-orange-400' },
                            ].map((stat, i) => (
                                <div key={i} className="glass p-4 hover:scale-105 transition cursor-pointer">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                        <stat.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                                    <p className="text-xs text-gray-400">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Quick Actions */}
                        <div className="glass p-4 mb-6">
                            <h3 className="font-bold text-white mb-4">Aksi Cepat</h3>
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { label: 'Pesanan Baru', icon: ClipboardList, action: () => setActiveMenu('orders'), count: orders.filter(o => o.status === 'pending').length },
                                    { label: 'Siap Antar', icon: Truck, action: () => { setActiveMenu('orders'); setStatusFilter('ready'); }, count: orders.filter(o => o.status === 'ready').length },
                                    { label: 'Refresh', icon: RefreshCw, action: () => user && fetchOrders(user.id) },
                                ].map((item, i) => (
                                    <button key={i} onClick={item.action} className="p-4 bg-white/5 hover:bg-white/10 rounded-xl text-center transition relative">
                                        <item.icon className="w-6 h-6 mx-auto mb-2 text-purple-400" />
                                        <p className="text-xs text-gray-300">{item.label}</p>
                                        {item.count !== undefined && item.count > 0 && (
                                            <span className="absolute top-2 right-2 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">{item.count}</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Recent Orders */}
                        <div className="glass p-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-white">Pesanan Terbaru</h3>
                                <button onClick={() => setActiveMenu('orders')} className="text-sm text-purple-400 hover:text-purple-300">Lihat Semua →</button>
                            </div>
                            {orders.slice(0, 3).map(order => {
                                const status = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
                                return (
                                    <div key={order.id} className="p-3 bg-white/5 rounded-xl mb-2 last:mb-0">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="font-medium text-white">{order.order_number}</p>
                                                <p className="text-sm text-gray-400">{order.customer_name}</p>
                                            </div>
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold ${status.color} text-white`}>{status.label}</span>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </>
                )}

                {/* Orders View */}
                {activeMenu === 'orders' && (
                    <>
                        {/* Filters */}
                        <div className="glass p-4 mb-6 overflow-x-auto">
                            <div className="flex gap-2 min-w-max">
                                <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Semua ({orders.length})</button>
                                {STATUS_OPTIONS.map(s => (
                                    <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === s.value ? s.color + ' text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                        {s.label} ({orders.filter(o => o.status === s.value).length})
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Orders List */}
                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" /></div>
                            ) : filteredOrders.length === 0 ? (
                                <div className="text-center py-12 text-gray-400">Tidak ada pesanan</div>
                            ) : (
                                filteredOrders.map(order => {
                                    const currentStatus = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
                                    return (
                                        <div key={order.id} className="glass p-5 border border-white/10 hover:border-white/20 transition">
                                            <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                                <div>
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <h3 className="font-bold text-lg text-white">{order.order_number || 'Order #' + order.id.slice(0, 6)}</h3>
                                                        <span className={`px-2 py-1 rounded-md text-xs font-bold ${currentStatus.color} text-white`}>{currentStatus.label}</span>
                                                    </div>
                                                    <p className="text-gray-300">{order.customer_name}</p>
                                                    <p className="text-sm text-gray-500">{order.pickup_address}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xl font-bold text-green-400">Rp {order.total?.toLocaleString()}</p>
                                                    <p className="text-sm text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-black/20 rounded-xl mb-4 text-sm text-gray-300 grid grid-cols-2 gap-2">
                                                <div><span className="text-gray-500">Tipe:</span> {order.order_type}</div>
                                                <div><span className="text-gray-500">Layanan:</span> {order.service_speed}</div>
                                                <div><span className="text-gray-500">Berat:</span> {order.weight_kg ? `${order.weight_kg} kg` : '-'}</div>
                                                <div><span className="text-gray-500">Catatan:</span> {order.notes || '-'}</div>
                                                <div className="col-span-2 flex items-center gap-2">
                                                    <span className="text-gray-500">WA:</span>
                                                    <a href={`https://wa.me/${order.customer_whatsapp?.replace(/^0/, '62')}`} target="_blank" className="text-green-400 hover:underline flex items-center gap-1">
                                                        <MessageCircle className="w-4 h-4" /> {order.customer_whatsapp}
                                                    </a>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-3 border-t border-white/10">
                                                <span className="text-sm text-gray-400">Update Status:</span>
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                                                    className="bg-gray-800 text-white px-3 py-2 rounded-xl text-sm border border-white/20 flex-1 max-w-xs"
                                                >
                                                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </>
                )}

                {/* Stats View */}
                {activeMenu === 'stats' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-6">Statistik Bisnis</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Total Pesanan', value: orders.length, color: 'text-blue-400' },
                                    { label: 'Pesanan Selesai', value: getCompletedOrders(), color: 'text-green-400' },
                                    { label: 'Total Pendapatan', value: `Rp ${getTotalRevenue().toLocaleString()}`, color: 'text-purple-400' },
                                    { label: 'Rata-rata Order', value: `Rp ${getAverageOrder().toLocaleString()}`, color: 'text-yellow-400' },
                                    { label: 'Dibatalkan', value: orders.filter(o => o.status === 'cancelled').length, color: 'text-red-400' },
                                    { label: 'Rating', value: '4.9 ⭐', color: 'text-orange-400' },
                                ].map((stat, i) => (
                                    <div key={i} className="p-4 bg-white/5 rounded-xl">
                                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                        <p className="text-sm text-gray-400">{stat.label}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Status Distribution */}
                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4">Distribusi Status</h3>
                            {STATUS_OPTIONS.map(status => {
                                const count = orders.filter(o => o.status === status.value).length
                                const percentage = orders.length > 0 ? (count / orders.length) * 100 : 0
                                return (
                                    <div key={status.value} className="mb-3">
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-300">{status.label}</span>
                                            <span className="text-sm text-gray-400">{count}</span>
                                        </div>
                                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                                            <div className={`h-full ${status.color} rounded-full transition-all`} style={{ width: `${percentage}%` }}></div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                )}

                {/* Profile View */}
                {activeMenu === 'profile' && (
                    <div className="glass p-6">
                        <div className="text-center mb-8">
                            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                                <User className="w-12 h-12 text-white" />
                            </div>
                            <h2 className="text-2xl font-bold text-white">{profile?.full_name || 'Merchant'}</h2>
                            <p className="text-gray-400">{profile?.email}</p>
                            <span className="inline-block mt-2 px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                                {profile?.role?.toUpperCase() || 'MERCHANT'}
                            </span>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                                <Phone className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Telepon</p>
                                    <p className="text-white">{profile?.phone || 'Belum diisi'}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                                <Star className="w-5 h-5 text-yellow-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Rating</p>
                                    <p className="text-white">4.9 / 5.0</p>
                                </div>
                            </div>
                            <div className="p-4 bg-white/5 rounded-xl flex items-center gap-4">
                                <FileText className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-sm text-gray-400">Total Order Ditangani</p>
                                    <p className="text-white">{orders.length} pesanan</p>
                                </div>
                            </div>
                        </div>

                        <Link href="/account" className="mt-6 block w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl text-white font-bold text-center hover:opacity-90 transition">
                            Edit Profil
                        </Link>
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 glass-bright border-t border-white/10 px-4 py-2 z-50">
                <div className="max-w-4xl mx-auto flex justify-around">
                    {MENU_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setActiveMenu(item.id)}
                            className={`flex flex-col items-center p-2 rounded-xl transition ${activeMenu === item.id ? 'text-purple-400' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <item.icon className="w-6 h-6 mb-1" />
                            <span className="text-xs">{item.label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </main>
    )
}
