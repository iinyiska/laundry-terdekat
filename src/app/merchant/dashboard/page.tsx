'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Package, DollarSign, Clock, TrendingUp, ChevronRight, Sparkles, Settings, LogOut, ClipboardList, CheckCircle, RefreshCw } from 'lucide-react'
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
}

const STATUS_OPTIONS = [
    { value: 'pending', label: 'Menunggu', color: 'bg-yellow-500' },
    { value: 'confirmed', label: 'Dikonfirmasi', color: 'bg-blue-500' },
    { value: 'pickup', label: 'Dijemput', color: 'bg-cyan-500' },
    { value: 'washing', label: 'Dicuci', color: 'bg-blue-400' },
    { value: 'drying', label: 'Dikeringkan', color: 'bg-orange-500' },
    { value: 'ironing', label: 'Disetrika', color: 'bg-purple-500' },
    { value: 'ready', label: 'Siap Antar', color: 'bg-green-400' },
    { value: 'delivery', label: 'Diantar', color: 'bg-cyan-400' },
    { value: 'completed', label: 'Selesai', color: 'bg-green-500' },
    { value: 'cancelled', label: 'Dibatalkan', color: 'bg-red-500' },
]

export default function MerchantDashboard() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [statusFilter, setStatusFilter] = useState('all')
    const supabase = createClient()

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user)
            fetchOrders(user.id)

            // Realtime subscription for orders
            const subscription = supabase
                .channel('merchant_orders')
                .on('postgres_changes', { event: '*', schema: 'public', table: 'orders', filter: `merchant_id=eq.${user.id}` }, () => fetchOrders(user.id))
                .subscribe()

            return () => { subscription.unsubscribe() }
        } else {
            setLoading(false)
            // Redirect or show login
            window.location.href = '/login'
        }
    }

    const fetchOrders = async (userId: string) => {
        setLoading(true)
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_id', userId)
            .order('created_at', { ascending: false })

        if (data) setOrders(data)
        setLoading(false)
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
            await supabase.from('order_status_history').insert({ order_id: orderId, status: newStatus, notes: 'Merchant Update' })
            fetchOrders(user.id) // Optimistic update ideally, but fetch is safer
        } catch (error) {
            console.error('Error updating status:', error)
        }
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const getTotalRevenue = () => {
        return orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + (o.total || 0), 0)
    }

    const filteredOrders = statusFilter === 'all' ? orders : orders.filter(o => o.status === statusFilter)

    if (!user && loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center floating">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                </div>
            </main>
        )
    }

    if (!user) return null

    return (
        <main className="min-h-screen pb-8">
            <div className="fixed inset-0 -z-10 overflow-hidden bg-slate-900">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">Merchant Panel</h1>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition text-red-400">
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </header>

            <div className="px-4 max-w-4xl mx-auto">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Pesanan Aktif', value: orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length, icon: Package, color: 'from-blue-500 to-cyan-400' },
                        { label: 'Selesai', value: orders.filter(o => o.status === 'completed').length, icon: CheckCircle, color: 'from-green-500 to-emerald-400' },
                        { label: 'Pendapatan', value: `Rp ${(getTotalRevenue() / 1000).toFixed(0)}k`, icon: DollarSign, color: 'from-purple-500 to-pink-400' },
                        { label: 'Rating', value: '4.9 ⭐', icon: TrendingUp, color: 'from-yellow-500 to-orange-400' },
                    ].map((stat, i) => (
                        <div key={i} className="glass p-4">
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3`}>
                                <stat.icon className="w-5 h-5 text-white" />
                            </div>
                            <p className="text-2xl font-bold text-white">{stat.value}</p>
                            <p className="text-xs text-gray-400">{stat.label}</p>
                        </div>
                    ))}
                </div>

                <div className="glass p-4 mb-6 overflow-x-auto">
                    <div className="flex gap-2 min-w-max">
                        <button onClick={() => setStatusFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === 'all' ? 'bg-white text-black' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>Semua</button>
                        {STATUS_OPTIONS.map(s => (
                            <button key={s.value} onClick={() => setStatusFilter(s.value)} className={`px-4 py-2 rounded-xl text-sm font-medium transition ${statusFilter === s.value ? s.color + ' text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}>
                                {s.label} ({orders.filter(o => o.status === s.value).length})
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white mb-4">Daftar Pesanan</h2>
                    {loading ? <div className="text-center py-12"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" /></div> :
                        filteredOrders.length === 0 ? <div className="text-center py-12 text-gray-400">Tidak ada pesanan</div> :
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
                                            <div className="col-span-2"><span className="text-gray-500">Catatan:</span> {order.notes || '-'}</div>
                                            <div className="col-span-2"><span className="text-gray-500">WA:</span> {order.customer_whatsapp}</div>
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
                            })}
                </div>
            </div>
        </main>
    )
}
