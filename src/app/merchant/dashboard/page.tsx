'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Package, DollarSign, Clock, TrendingUp, ChevronRight, Sparkles, Settings, LogOut } from 'lucide-react'
import Link from 'next/link'

type Service = {
    id: string
    name: string
    description: string
    price_per_unit: number
    unit_type: string
}

type Order = {
    id: string
    status: string
    total_price: number
    created_at: string
}

export default function MerchantDashboard() {
    const [services, setServices] = useState<Service[]>([])
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const [user, setUser] = useState<any>(null)
    const supabase = createClient()

    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price_per_unit: '',
        unit_type: 'kg'
    })

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
            setUser(user)
            fetchServices(user.id)
            fetchOrders(user.id)
        }
        setLoading(false)
    }

    const fetchServices = async (userId: string) => {
        const { data } = await supabase
            .from('services')
            .select('*')
            .eq('merchant_id', userId)
            .order('created_at', { ascending: false })

        if (data) setServices(data)
    }

    const fetchOrders = async (userId: string) => {
        const { data } = await supabase
            .from('orders')
            .select('*')
            .eq('merchant_id', userId)
            .order('created_at', { ascending: false })
            .limit(10)

        if (data) setOrders(data)
    }

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) return

        const { error } = await supabase.from('services').insert({
            merchant_id: user.id,
            name: newService.name,
            description: newService.description,
            price_per_unit: parseFloat(newService.price_per_unit),
            unit_type: newService.unit_type
        })

        if (!error) {
            setNewService({ name: '', description: '', price_per_unit: '', unit_type: 'kg' })
            setIsAdding(false)
            fetchServices(user.id)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus layanan ini?')) return
        await supabase.from('services').delete().eq('id', id)
        if (user) fetchServices(user.id)
    }

    const handleLogout = async () => {
        await supabase.auth.signOut()
        window.location.href = '/'
    }

    const getTotalRevenue = () => {
        return orders.reduce((sum, o) => sum + (o.total_price || 0), 0)
    }

    if (loading) {
        return (
            <main className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center floating">
                        <Sparkles className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-400">Loading dashboard...</p>
                </div>
            </main>
        )
    }

    if (!user) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="glass p-8 text-center max-w-md">
                    <h2 className="text-2xl font-bold text-white mb-4">Akses Ditolak</h2>
                    <p className="text-gray-400 mb-6">Silakan login sebagai Mitra Laundry untuk mengakses dashboard.</p>
                    <Link href="/login" className="btn-gradient inline-block">Login Sekarang</Link>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-8">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-6">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-lg text-white">Mitra Dashboard</h1>
                            <p className="text-xs text-gray-400">{user.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <Settings className="w-5 h-5 text-gray-400" />
                        </button>
                        <button onClick={handleLogout} className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 transition text-red-400">
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <div className="px-4 max-w-4xl mx-auto">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                        { label: 'Layanan Aktif', value: services.length, icon: Package, color: 'from-blue-500 to-cyan-400' },
                        { label: 'Total Pesanan', value: orders.length, icon: Clock, color: 'from-purple-500 to-pink-400' },
                        { label: 'Pendapatan', value: `Rp ${(getTotalRevenue() / 1000).toFixed(0)}k`, icon: DollarSign, color: 'from-green-500 to-emerald-400' },
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

                {/* Services Section */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold gradient-text">Layanan Saya</h2>
                        <button
                            onClick={() => setIsAdding(!isAdding)}
                            className="btn-gradient text-sm py-2 px-4 flex items-center gap-2"
                        >
                            <Plus className="w-4 h-4" />
                            Tambah
                        </button>
                    </div>

                    {isAdding && (
                        <div className="glass p-6 mb-4">
                            <h3 className="font-semibold text-white mb-4">Layanan Baru</h3>
                            <form onSubmit={handleAddService} className="grid md:grid-cols-2 gap-4">
                                <input
                                    className="input-glass"
                                    placeholder="Nama Layanan"
                                    required
                                    value={newService.name}
                                    onChange={e => setNewService({ ...newService, name: e.target.value })}
                                />
                                <input
                                    className="input-glass"
                                    placeholder="Harga (contoh: 7000)"
                                    type="number"
                                    required
                                    value={newService.price_per_unit}
                                    onChange={e => setNewService({ ...newService, price_per_unit: e.target.value })}
                                />
                                <select
                                    className="input-glass"
                                    value={newService.unit_type}
                                    onChange={e => setNewService({ ...newService, unit_type: e.target.value })}
                                >
                                    <option value="kg">per Kg</option>
                                    <option value="pcs">per Lembar/Pcs</option>
                                    <option value="mtr">per Meter</option>
                                </select>
                                <input
                                    className="input-glass"
                                    placeholder="Deskripsi (opsional)"
                                    value={newService.description}
                                    onChange={e => setNewService({ ...newService, description: e.target.value })}
                                />
                                <div className="md:col-span-2 flex justify-end gap-3">
                                    <button type="button" onClick={() => setIsAdding(false)} className="px-4 py-2 text-gray-400 font-medium">
                                        Batal
                                    </button>
                                    <button type="submit" className="btn-gradient py-2 px-6">
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                        {services.map(service => (
                            <div key={service.id} className="glass p-5 card-hover">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h3 className="font-bold text-lg text-white mb-1">{service.name}</h3>
                                        <p className="text-sm text-gray-400 mb-3">{service.description || 'Tidak ada deskripsi'}</p>
                                        <span className="inline-block bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 text-sm px-3 py-1 rounded-full font-semibold">
                                            Rp {service.price_per_unit.toLocaleString('id-ID')} / {service.unit_type}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(service.id)}
                                        className="p-2 rounded-xl bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                        {services.length === 0 && (
                            <div className="col-span-full glass p-8 text-center text-gray-400">
                                <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Belum ada layanan. Klik "Tambah" untuk membuat.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Orders */}
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold gradient-text">Pesanan Terbaru</h2>
                        <Link href="/merchant/orders" className="text-blue-400 text-sm font-medium flex items-center gap-1">
                            Lihat Semua <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>

                    {orders.length > 0 ? (
                        <div className="space-y-3">
                            {orders.slice(0, 5).map(order => (
                                <div key={order.id} className="glass p-4 flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-white">Pesanan #{order.id.slice(0, 8)}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString('id-ID')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-white">Rp {order.total_price?.toLocaleString('id-ID') || '0'}</p>
                                        <span className={`text-xs px-2 py-1 rounded-full ${order.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                                                order.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                            }`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass p-8 text-center text-gray-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>Belum ada pesanan masuk.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}
