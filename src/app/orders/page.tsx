'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Package, Clock, MapPin, Check, Truck, Loader2, RefreshCw } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type Order = {
    id: string
    order_number: string
    customer_name: string
    order_type: string
    service_speed: string
    total: number
    status: string
    pickup_address: string
    pickup_kelurahan: string
    pickup_city: string
    created_at: string
    weight_kg: number | null
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Package }> = {
    pending: { label: 'Menunggu', color: 'text-yellow-400', icon: Clock },
    confirmed: { label: 'Dikonfirmasi', color: 'text-blue-400', icon: Check },
    pickup: { label: 'Dijemput', color: 'text-cyan-400', icon: Truck },
    washing: { label: 'Dicuci', color: 'text-blue-400', icon: Package },
    drying: { label: 'Dikeringkan', color: 'text-orange-400', icon: Package },
    ironing: { label: 'Disetrika', color: 'text-purple-400', icon: Package },
    ready: { label: 'Siap Antar', color: 'text-green-400', icon: Check },
    delivery: { label: 'Diantar', color: 'text-cyan-400', icon: Truck },
    completed: { label: 'Selesai', color: 'text-green-500', icon: Check },
    cancelled: { label: 'Dibatalkan', color: 'text-red-400', icon: Package },
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        // Load cache first
        const cached = localStorage.getItem('laundry_orders_cache')
        if (cached) {
            try {
                setOrders(JSON.parse(cached))
                setLoading(false)
            } catch { }
        }

        loadOrders()

        // Realtime Subscription
        const channel = supabase
            .channel('orders_realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' },
                () => loadOrders() // Refresh when orders change
            )
            .subscribe()

        return () => { supabase.removeChannel(channel) }
    }, [])

    const loadOrders = async () => {
        // Get user for filtering
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Only show spinner if no cache
        if (!localStorage.getItem('laundry_orders_cache')) {
            setLoading(true)
        }

        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('user_id', user.id) // Critical: Filter by user
            .order('created_at', { ascending: false })
            .limit(50)

        if (data) {
            setOrders(data)
            localStorage.setItem('laundry_orders_cache', JSON.stringify(data))
        }
        setLoading(false)
    }

    const formatDate = (dateStr: string) => {
        if (!dateStr) return ''
        const date = new Date(dateStr)
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    }

    return (
        <main className="min-h-screen pb-32">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><ChevronLeft className="w-5 h-5" /></Link>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-white">Riwayat Pesanan</h1>
                        <p className="text-xs text-gray-400">{orders.length} pesanan</p>
                    </div>
                    <button onClick={loadOrders} className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} /></button>
                </div>
            </header>

            <div className="px-4 max-w-2xl mx-auto py-6">
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : orders.length === 0 ? (
                    <div className="text-center py-20">
                        <Package className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <p className="text-gray-400 mb-4">Belum ada pesanan</p>
                        <Link href="/order" className="btn-gradient px-6 py-3">Order Sekarang</Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending
                            const StatusIcon = statusConfig.icon

                            return (
                                <div key={order.id} className="glass p-4 space-y-3">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-bold text-white">{order.order_number}</p>
                                            <p className="text-xs text-gray-500">{formatDate(order.created_at)}</p>
                                        </div>
                                        <div className={`flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 ${statusConfig.color}`}>
                                            <StatusIcon className="w-4 h-4" />
                                            <span className="text-xs font-medium">{statusConfig.label}</span>
                                        </div>
                                    </div>

                                    <div className="text-sm">
                                        <div className="flex items-center gap-2 text-gray-400 mb-1">
                                            <MapPin className="w-4 h-4" />
                                            <span>{order.pickup_address}, {order.pickup_kelurahan}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-gray-400">{order.order_type === 'kiloan' ? `${order.weight_kg} kg` : 'Satuan'}</span>
                                            <span className={order.service_speed === 'express' ? 'text-yellow-400' : 'text-blue-400'}>
                                                {order.service_speed === 'express' ? '⚡ Express' : '🕐 Reguler'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                                        <span className="text-gray-400">Total</span>
                                        <span className="font-bold text-green-400">Rp {order.total.toLocaleString()}</span>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </main>
    )
}

