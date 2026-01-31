'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Shield, Save, Plus, Trash2, Edit2, ChevronLeft, Palette, Type, Gift, Package, Lock, Check, X, Home, FileText, Zap, Layout, Upload, RefreshCw, AlertCircle, Users, ClipboardList, Phone, Mail, MapPin, Eye } from 'lucide-react'
import Link from 'next/link'

const ADMIN_PASSWORD = 'admin123laundry'

type SiteSettings = {
    hero_title: string
    hero_subtitle: string
    promo_text: string
    promo_enabled: boolean
    primary_color: string
    accent_color: string
    dashboard_title: string
    dashboard_merchant_prefix: string
    feature_1_title: string
    feature_1_desc: string
    feature_2_title: string
    feature_2_desc: string
    feature_3_title: string
    feature_3_desc: string
    feature_4_title: string
    feature_4_desc: string
    regular_label: string
    regular_price_per_kg: number
    regular_eta: string
    express_label: string
    express_price_per_kg: number
    express_eta: string
    express_enabled: boolean
    bg_theme: string
    custom_bg_url: string
}

type PlatformService = {
    id: string
    name: string
    icon: string
    price: number
    unit_type: string
    is_active: boolean
    sort_order: number
}

type UserProfile = {
    id: string
    email?: string
    full_name?: string
    phone?: string
    role?: string
    created_at?: string
}

type Order = {
    id: string
    order_number: string
    customer_name: string
    customer_whatsapp: string
    pickup_address: string
    order_type: string
    service_speed: string
    status: string
    total: number
    weight_kg?: number
    created_at: string
    user_id?: string
    merchant_id?: string
    notes?: string
    items?: any[]
    items_detail?: Record<string, number>
}

const DEFAULT_SETTINGS: SiteSettings = {
    hero_title: 'Cuci Bersih, Wangi Sempurna',
    hero_subtitle: 'Platform laundry paling canggih dengan deteksi lokasi otomatis.',
    promo_text: 'Diskon 20% untuk Member Baru!',
    promo_enabled: true,
    primary_color: '#3b82f6',
    accent_color: '#8b5cf6',
    dashboard_title: 'Pilih Outlet Terdekat',
    dashboard_merchant_prefix: 'Laundry Terdekat',
    feature_1_title: 'Terdekat',
    feature_1_desc: 'Outlet resmi di sekitarmu',
    feature_2_title: 'Antar Jemput',
    feature_2_desc: 'Gratis ongkir hingga 5km',
    feature_3_title: 'Cepat',
    feature_3_desc: 'Estimasi 24 jam selesai',
    feature_4_title: 'Aman',
    feature_4_desc: 'Garansi cucian hilang',
    regular_label: 'Reguler (24 Jam)',
    regular_price_per_kg: 7000,
    regular_eta: '24 jam',
    express_label: 'Express (8 Jam)',
    express_price_per_kg: 15000,
    express_eta: '8 jam',
    express_enabled: true,
    bg_theme: 'gradient',
    custom_bg_url: ''
}

const BG_THEMES = [
    { id: 'gradient', name: 'Gradient Modern', preview: 'linear-gradient(135deg, #0f172a, #1e293b)' },
    { id: 'dark', name: 'Dark Minimal', preview: '#0a0a0a' },
    { id: 'blue', name: 'Ocean Blue', preview: 'linear-gradient(135deg, #0c4a6e, #164e63)' },
    { id: 'purple', name: 'Royal Purple', preview: 'linear-gradient(135deg, #4c1d95, #581c87)' },
    { id: 'custom', name: 'Custom Upload', preview: '' },
]

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

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [activeTab, setActiveTab] = useState<'orders' | 'users' | 'theme' | 'home' | 'content' | 'services' | 'settings'>('orders')
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [services, setServices] = useState<PlatformService[]>([])
    const [newService, setNewService] = useState<Partial<PlatformService>>({ name: '', icon: '👕', price: 5000, unit_type: 'pcs', is_active: true })
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState({ type: '', msg: '' })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [users, setUsers] = useState<UserProfile[]>([])
    const [usersLoading, setUsersLoading] = useState(false)
    const [orders, setOrders] = useState<Order[]>([])
    const [ordersLoading, setOrdersLoading] = useState(false)
    const [orderFilter, setOrderFilter] = useState('all')
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
    const supabase = createClient()

    useEffect(() => {
        if (sessionStorage.getItem('admin_auth') === 'true') {
            setIsAuthenticated(true)
            loadData()
        }
    }, [])

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            sessionStorage.setItem('admin_auth', 'true')
            loadData()
        } else {
            setAuthError('Password salah!')
        }
    }

    const showStatus = (type: 'success' | 'error' | 'info', msg: string) => {
        setStatus({ type, msg })
        if (type === 'success') setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
    }

    const [merchants, setMerchants] = useState<UserProfile[]>([])

    // Load merchants
    const loadMerchants = async () => {
        const { data } = await supabase.from('profiles').select('*').eq('role', 'merchant')
        if (data) setMerchants(data)
    }

    const loadData = async () => {
        showStatus('info', 'Loading...')
        try { const { data: s } = await supabase.from('site_settings').select('*').eq('id', 'main').single(); if (s) setSettings({ ...DEFAULT_SETTINGS, ...s }) } catch { }
        try { const { data: svc } = await supabase.from('platform_services').select('*').order('sort_order'); if (svc) setServices(svc) } catch { }
        loadUsers()
        loadOrders()
        loadMerchants()
        showStatus('success', 'Data loaded!')
    }

    const assignMerchant = async (orderId: string, merchantId: string) => {
        try {
            await supabase.from('orders').update({ merchant_id: merchantId, status: 'confirmed' }).eq('id', orderId)
            await supabase.from('order_status_history').insert({ order_id: orderId, status: 'confirmed', notes: 'Merchant Assigned' })
            showStatus('success', 'Merchant Assigned!')
            loadOrders()
            // Update local selectedOrder if open
            if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, merchant_id: merchantId })
        } catch (e: any) { showStatus('error', e.message) }
    }

    const loadUsers = async () => {
        setUsersLoading(true)
        try { const { data } = await supabase.from('profiles').select('*').order('created_at', { ascending: false }); if (data) setUsers(data) } catch { }
        setUsersLoading(false)
    }

    const loadOrders = async () => {
        setOrdersLoading(true)
        try { const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(100); if (data) setOrders(data) } catch { }
        setOrdersLoading(false)
    }

    const updateUserRole = async (userId: string, newRole: string) => {
        try { await supabase.from('profiles').update({ role: newRole }).eq('id', userId); showStatus('success', 'Role updated!'); loadUsers() } catch (e: any) { showStatus('error', e.message) }
    }

    const deleteUser = async (userId: string) => {
        if (!confirm('Hapus user ini?')) return
        try { await supabase.from('profiles').delete().eq('id', userId); showStatus('success', 'User deleted!'); loadUsers() } catch (e: any) { showStatus('error', e.message) }
    }

    const updateOrderStatus = async (orderId: string, newStatus: string) => {
        try {
            await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
            await supabase.from('order_status_history').insert({ order_id: orderId, status: newStatus, notes: 'Diubah Admin' })
            showStatus('success', 'Status updated!')
            loadOrders()
            if (selectedOrder?.id === orderId) setSelectedOrder({ ...selectedOrder, status: newStatus })
        } catch (e: any) { showStatus('error', e.message) }
    }

    const saveSettings = async () => {
        setSaving(true)
        localStorage.setItem('laundry_settings', JSON.stringify(settings))
        try { await supabase.from('site_settings').upsert({ id: 'main', ...settings, updated_at: new Date().toISOString() }, { onConflict: 'id' }); showStatus('success', 'Saved!') } catch (e: any) { showStatus('error', e.message) }
        setSaving(false)
    }

    const selectTheme = async (themeId: string) => {
        setSettings({ ...settings, bg_theme: themeId })
        localStorage.setItem('laundry_settings', JSON.stringify({ ...settings, bg_theme: themeId }))
        try { await supabase.from('site_settings').upsert({ id: 'main', bg_theme: themeId }, { onConflict: 'id' }); showStatus('success', 'Theme saved!') } catch { }
    }

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file || !file.type.startsWith('image/')) return

        // Limit to 10MB as requested by User (Note: Larger files may lag)
        if (file.size > 10 * 1024 * 1024) {
            showStatus('error', 'File terlalu besar! Max 10MB');
            return;
        }

        setUploading(true)
        const reader = new FileReader()

        reader.onload = async () => {
            const base64 = reader.result as string

            // 1. Update State
            const newSettings = { ...settings, custom_bg_url: base64, bg_theme: 'custom' }
            setSettings(newSettings)

            // 2. Update LocalStorage (Safe Mode)
            try {
                localStorage.setItem('laundry_settings', JSON.stringify(newSettings))
            } catch (e) {
                console.error('LocalStorage full:', e)
                // Don't stop execution, continue to Supabase
            }

            // 3. Sync to Supabase (Persistence)
            try {
                const { error } = await supabase
                    .from('site_settings')
                    .upsert({
                        id: 'main',
                        ...newSettings, // Sync everything to be safe
                        updated_at: new Date().toISOString()
                    }, { onConflict: 'id' })

                if (error) throw error
                showStatus('success', 'Background uploaded & synced!')
            } catch (err: any) {
                showStatus('error', 'Upload failed: ' + err.message)
            }

            setUploading(false)
            // Reset input so change event triggers again for same file
            if (fileInputRef.current) fileInputRef.current.value = ''
        }

        reader.readAsDataURL(file)
    }

    const addService = async () => {
        if (!newService.name) return
        await supabase.from('platform_services').insert({ ...newService, sort_order: services.length + 1 })
        loadData()
        setNewService({ name: '', icon: '👕', price: 5000, unit_type: 'pcs', is_active: true })
    }

    const deleteService = async (id: string) => {
        if (!confirm('Hapus?')) return
        await supabase.from('platform_services').delete().eq('id', id)
        loadData()
    }

    const formatDate = (d: string) => d ? new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'
    const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter)

    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>
                <div className="glass p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><Shield className="w-8 h-8 text-white" /></div>
                        <h2 className="text-2xl font-bold text-white">Super Admin Panel</h2>
                    </div>
                    {authError && <div className="bg-red-500/20 text-red-300 p-3 rounded-xl mb-4 text-sm text-center">{authError}</div>}
                    <div className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input type="password" className="input-glass w-full pl-12" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleLogin()} />
                        </div>
                        <button onClick={handleLogin} className="btn-gradient w-full py-4">Masuk</button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-8">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>
            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-4">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><ChevronLeft className="w-5 h-5" /></Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
                            <h1 className="font-bold text-lg text-white">Super Admin <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">FULL</span></h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadData} className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><RefreshCw className="w-5 h-5" /></button>
                        <button onClick={saveSettings} disabled={saving} className="btn-gradient py-2 px-4 flex items-center gap-2">{saving ? '...' : <><Save className="w-4 h-4" />Simpan</>}</button>
                    </div>
                </div>
            </header>

            {status.msg && (
                <div className="px-4 max-w-6xl mx-auto mb-4">
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/20 text-red-300' : status.type === 'success' ? 'bg-green-500/20 text-green-300' : 'bg-blue-500/20 text-blue-300'}`}>
                        {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {status.type === 'success' && <Check className="w-5 h-5" />}
                        <span>{status.msg}</span>
                    </div>
                </div>
            )}

            <div className="px-4 max-w-6xl mx-auto">
                <div className="glass p-2 flex gap-2 mb-6 overflow-x-auto">
                    {[
                        { id: 'orders', label: 'Pesanan', icon: ClipboardList, badge: orders.filter(o => o.status === 'pending').length },
                        { id: 'users', label: 'Users', icon: Users, badge: users.length },
                        { id: 'theme', label: 'Tema', icon: Layout },
                        { id: 'services', label: 'Layanan', icon: Package },
                        { id: 'home', label: 'Beranda', icon: Home },
                        { id: 'content', label: 'Konten', icon: FileText },
                        { id: 'settings', label: 'Warna', icon: Palette },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 whitespace-nowrap relative ${activeTab === tab.id ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                            {tab.badge !== undefined && tab.badge > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{tab.badge}</span>}
                        </button>
                    ))}
                </div>

                {activeTab === 'orders' && (
                    <div className="space-y-6">
                        <div className="glass p-4">
                            <div className="flex flex-wrap gap-2">
                                <button onClick={() => setOrderFilter('all')} className={`px-4 py-2 rounded-xl text-sm font-medium ${orderFilter === 'all' ? 'bg-white text-black' : 'bg-white/10 text-white'}`}>Semua ({orders.length})</button>
                                {STATUS_OPTIONS.slice(0, 5).map(s => (
                                    <button key={s.value} onClick={() => setOrderFilter(s.value)} className={`px-4 py-2 rounded-xl text-sm font-medium ${orderFilter === s.value ? s.color + ' text-white' : 'bg-white/10 text-white'}`}>{s.label} ({orders.filter(o => o.status === s.value).length})</button>
                                ))}
                            </div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><ClipboardList className="w-5 h-5 text-blue-400" />Daftar Pesanan ({filteredOrders.length})</h3>
                            {ordersLoading ? <div className="text-center py-10"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-400" /></div>
                                : filteredOrders.length === 0 ? <div className="text-center py-10 text-gray-400">Tidak ada pesanan</div>
                                    : <div className="space-y-4">
                                        {filteredOrders.map(order => {
                                            const si = STATUS_OPTIONS.find(s => s.value === order.status) || STATUS_OPTIONS[0]
                                            return (
                                                <div key={order.id} className="p-4 bg-white/5 rounded-xl border border-white/10">
                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                        <div className="flex-1 min-w-[200px]">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="font-bold text-white">{order.order_number}</span>
                                                                <span className={`px-2 py-1 rounded-full text-xs ${si.color} text-white`}>{si.label}</span>
                                                            </div>
                                                            <p className="text-gray-300">{order.customer_name}</p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{order.customer_whatsapp}</p>
                                                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1"><MapPin className="w-3 h-3" />{order.pickup_address?.substring(0, 50)}...</p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="text-green-400 font-bold text-lg">Rp {order.total?.toLocaleString()}</p>
                                                            <p className="text-sm text-gray-500">{order.order_type} • {order.service_speed}</p>
                                                            <p className="text-xs text-gray-600">{formatDate(order.created_at)}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex flex-wrap items-center gap-2 mt-4 pt-4 border-t border-white/10">
                                                        <span className="text-sm text-gray-400">Ubah Status:</span>
                                                        <select value={order.status} onChange={(e) => updateOrderStatus(order.id, e.target.value)} className="bg-gray-800 text-white px-3 py-2 rounded-xl text-sm border border-white/20">
                                                            {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                        </select>
                                                        <button onClick={() => setSelectedOrder(order)} className="ml-auto px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm flex items-center gap-1"><Eye className="w-4 h-4" />Detail</button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>}
                        </div>
                        {selectedOrder && (
                            <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
                                <div className="glass p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-bold text-xl text-white">Detail Pesanan</h3>
                                        <button onClick={() => setSelectedOrder(null)} className="p-2 bg-white/10 rounded-xl"><X className="w-5 h-5" /></button>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="p-4 bg-white/5 rounded-xl">
                                            <p className="text-2xl font-bold text-white mb-2">{selectedOrder.order_number}</p>
                                            <p className="text-green-400 text-xl font-bold">Rp {selectedOrder.total?.toLocaleString()}</p>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div><p className="text-gray-500 text-sm">Nama</p><p className="text-white">{selectedOrder.customer_name}</p></div>
                                            <div><p className="text-gray-500 text-sm">WhatsApp</p><p className="text-white">{selectedOrder.customer_whatsapp}</p></div>
                                            <div><p className="text-gray-500 text-sm">Tipe</p><p className="text-white capitalize">{selectedOrder.order_type}</p></div>
                                            <div><p className="text-gray-500 text-sm">Kecepatan</p><p className="text-white capitalize">{selectedOrder.service_speed}</p></div>
                                        </div>
                                        <div><p className="text-gray-500 text-sm">Alamat</p><p className="text-white">{selectedOrder.pickup_address}</p></div>
                                        {selectedOrder.notes && <div><p className="text-gray-500 text-sm">Catatan</p><p className="text-white">{selectedOrder.notes}</p></div>}

                                        <div className="bg-white/5 p-4 rounded-xl">
                                            <p className="text-gray-400 text-sm mb-2 font-bold mb-2">Detail Item</p>

                                            {/* Debug info: remove in production if unneeded, helps verify data */}
                                            {/* <p className="text-xs text-gray-600 mb-2">Type: {selectedOrder.order_type}, Items: {selectedOrder.items?.length}</p> */}

                                            {selectedOrder.order_type === 'satuan' ? (
                                                selectedOrder.items && selectedOrder.items.length > 0 ? (
                                                    <div className="space-y-2">
                                                        {selectedOrder.items.map((item: any, idx: number) => (
                                                            <div key={idx} className="flex justify-between text-sm border-b border-white/10 pb-1 last:border-0">
                                                                <span className="text-white">{item.qty}x {item.name}</span>
                                                                <span className="text-gray-400">Rp {item.price?.toLocaleString()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : <p className="text-gray-500 text-sm italic">Item satuan kosong (Cek DB)</p>
                                            ) : selectedOrder.order_type === 'kiloan' ? (
                                                selectedOrder.items_detail ? (
                                                    <div className="space-y-2">
                                                        {Object.entries(selectedOrder.items_detail).map(([key, qty]: [string, any]) => (
                                                            qty > 0 && (
                                                                <div key={key} className="flex justify-between text-sm">
                                                                    <span className="text-white capitalize">{key.replace(/_/g, ' ')}</span>
                                                                    <span className="text-gray-400">{qty} pcs</span>
                                                                </div>
                                                            )
                                                        ))}
                                                    </div>
                                                ) : <p className="text-gray-500 text-sm italic">Tidak ada detail kiloan</p>
                                            ) : (
                                                <p className="text-gray-500 text-sm italic">Tipe order tidak diketahui</p>
                                            )}
                                        </div>
                                        <div className="pt-4 border-t border-white/10 space-y-4">
                                            <div>
                                                <p className="text-gray-500 text-sm mb-2">Assign to Merchant</p>
                                                <select
                                                    value={selectedOrder.merchant_id || ''}
                                                    onChange={(e) => assignMerchant(selectedOrder.id, e.target.value)}
                                                    className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-white/20"
                                                >
                                                    <option value="">-- Pilih Merchant --</option>
                                                    {merchants.map(m => (
                                                        <option key={m.id} value={m.id}>{m.full_name || m.email} - {m.phone || 'No Phone'}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm mb-2">Update Status</p>
                                                <select value={selectedOrder.status} onChange={(e) => updateOrderStatus(selectedOrder.id, e.target.value)} className="w-full bg-gray-800 text-white px-4 py-3 rounded-xl border border-white/20">
                                                    {STATUS_OPTIONS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'users' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" />Manajemen User ({users.length})</h3>
                            {usersLoading ? <div className="text-center py-10"><RefreshCw className="w-8 h-8 animate-spin mx-auto text-purple-400" /></div>
                                : users.length === 0 ? <div className="text-center py-10 text-gray-400">Belum ada user</div>
                                    : <div className="space-y-3">
                                        {users.map(user => (
                                            <div key={user.id} className="p-4 bg-white/5 rounded-xl border border-white/10 flex flex-wrap items-center gap-4">
                                                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                                    {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase() || '?'}
                                                </div>
                                                <div className="flex-1 min-w-[200px]">
                                                    <p className="font-bold text-white">{user.full_name || 'Tanpa Nama'}</p>
                                                    <p className="text-sm text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" />{user.email || '-'}</p>
                                                    {user.phone && <p className="text-sm text-gray-500 flex items-center gap-1"><Phone className="w-3 h-3" />{user.phone}</p>}
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select value={user.role || 'customer'} onChange={(e) => updateUserRole(user.id, e.target.value)} className={`px-3 py-2 rounded-xl text-sm font-medium border border-white/20 ${user.role === 'admin' ? 'bg-red-500/20 text-red-400' : user.role === 'merchant' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                                                        <option value="customer">Customer</option>
                                                        <option value="merchant">Merchant</option>
                                                        <option value="admin">Admin</option>
                                                    </select>
                                                    <button onClick={() => deleteUser(user.id)} className="p-2 bg-red-500/20 text-red-400 rounded-xl hover:bg-red-500/30"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>}
                        </div>
                        <div className="glass p-4">
                            <h4 className="text-sm text-gray-400 mb-2">Keterangan Role:</h4>
                            <div className="flex flex-wrap gap-4 text-sm">
                                <span className="text-blue-400">🔵 Customer = User biasa</span>
                                <span className="text-yellow-400">🟡 Merchant = Pemilik laundry</span>
                                <span className="text-red-400">🔴 Admin = Akses penuh</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'theme' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2"><Upload className="w-6 h-6 text-green-400" />Upload Background</h3>
                            <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleBgUpload} />
                            <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="w-full flex items-center justify-center gap-4 p-8 border-2 border-dashed border-white/30 rounded-2xl hover:border-green-500/50 cursor-pointer">
                                <Upload className={`w-10 h-10 ${uploading ? 'animate-pulse text-gray-500' : 'text-green-400'}`} />
                                <div className="text-left"><p className="text-white font-bold">{uploading ? 'Uploading...' : 'Klik untuk upload'}</p><p className="text-gray-400">JPG, PNG (Max 5MB)</p></div>
                            </button>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-4">Pilih Tema</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                {BG_THEMES.map((theme) => (
                                    <button key={theme.id} onClick={() => selectTheme(theme.id)} className={`p-4 rounded-2xl border-2 ${settings.bg_theme === theme.id ? 'border-green-500 ring-4 ring-green-500/30' : 'border-white/20'}`}>
                                        <div className="w-full h-20 rounded-xl mb-2" style={{ background: theme.id === 'custom' ? (settings.custom_bg_url ? `url(${settings.custom_bg_url})` : '#333') : theme.preview, backgroundSize: 'cover', backgroundPosition: 'center' }} />
                                        <p className="font-bold text-white text-sm">{theme.name}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4"><Plus className="w-5 h-5 text-green-400 inline mr-2" />Tambah Layanan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <input className="input-glass col-span-2" placeholder="Nama" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                                <input className="input-glass" placeholder="Icon" value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} />
                                <input className="input-glass" type="number" placeholder="Harga" value={newService.price} onChange={(e) => setNewService({ ...newService, price: +e.target.value })} />
                                <select className="input-glass bg-gray-800" value={newService.unit_type} onChange={(e) => setNewService({ ...newService, unit_type: e.target.value })}><option value="pcs">Per Pcs</option><option value="kg">Per Kg</option></select>
                            </div>
                            <button onClick={addService} className="btn-gradient mt-4 py-2 px-6"><Plus className="w-4 h-4 inline mr-2" />Tambah</button>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4"><Package className="w-5 h-5 text-blue-400 inline mr-2" />Daftar ({services.length})</h3>
                            <div className="space-y-3">
                                {services.map((s) => (
                                    <div key={s.id} className={`p-4 rounded-xl border flex items-center gap-4 ${s.is_active ? 'bg-white/5 border-white/10' : 'bg-gray-800/50 border-gray-700 opacity-60'}`}>
                                        <span className="text-2xl">{s.icon}</span>
                                        <div className="flex-1"><p className="font-medium text-white">{s.name}</p><p className="text-sm text-blue-400">Rp {s.price.toLocaleString()} / {s.unit_type}</p></div>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => supabase.from('platform_services').update({ is_active: !s.is_active }).eq('id', s.id).then(loadData)} className={`px-3 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s.is_active ? 'Aktif' : 'Off'}</button>
                                            <button onClick={() => deleteService(s.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'home' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Type className="w-5 h-5 text-blue-400" />Hero Section</h3>
                            <div className="space-y-4">
                                <div><label className="text-sm text-gray-400 mb-2 block">Judul</label><input className="input-glass w-full" value={settings.hero_title} onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })} /></div>
                                <div><label className="text-sm text-gray-400 mb-2 block">Deskripsi</label><textarea className="input-glass w-full" rows={3} value={settings.hero_subtitle} onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })} /></div>
                            </div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-yellow-400" />Promo</h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between"><span className="text-gray-300">Tampilkan Promo</span><button onClick={() => setSettings({ ...settings, promo_enabled: !settings.promo_enabled })} className={`w-14 h-8 rounded-full relative transition-colors ${settings.promo_enabled ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${settings.promo_enabled ? 'left-7' : 'left-1'}`} /></button></div>
                                <input className="input-glass w-full" value={settings.promo_text} onChange={(e) => setSettings({ ...settings, promo_text: e.target.value })} placeholder="Teks Promo" />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Dashboard Order</h3>
                            <div><label className="text-sm text-gray-400 mb-2 block">Judul</label><input className="input-glass w-full" value={settings.dashboard_title} onChange={(e) => setSettings({ ...settings, dashboard_title: e.target.value })} /></div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Reguler & Express</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                    <p className="text-blue-400 font-semibold mb-3">Reguler</p>
                                    <input className="input-glass w-full text-sm mb-2" value={settings.regular_label} onChange={(e) => setSettings({ ...settings, regular_label: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input className="input-glass flex-1 text-sm" type="number" value={settings.regular_price_per_kg} onChange={(e) => setSettings({ ...settings, regular_price_per_kg: +e.target.value })} />
                                        <input className="input-glass flex-1 text-sm" value={settings.regular_eta} onChange={(e) => setSettings({ ...settings, regular_eta: e.target.value })} />
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
                                    <div className="flex justify-between items-center mb-3"><p className="text-yellow-400 font-semibold">Express ⚡</p><button onClick={() => setSettings({ ...settings, express_enabled: !settings.express_enabled })} className={`w-12 h-7 rounded-full relative transition-colors ${settings.express_enabled ? 'bg-green-500' : 'bg-gray-600'}`}><div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${settings.express_enabled ? 'left-6' : 'left-1'}`} /></button></div>
                                    <input className="input-glass w-full text-sm mb-2" value={settings.express_label} onChange={(e) => setSettings({ ...settings, express_label: e.target.value })} />
                                    <div className="flex gap-2">
                                        <input className="input-glass flex-1 text-sm" type="number" value={settings.express_price_per_kg} onChange={(e) => setSettings({ ...settings, express_price_per_kg: +e.target.value })} />
                                        <input className="input-glass flex-1 text-sm" value={settings.express_eta} onChange={(e) => setSettings({ ...settings, express_eta: e.target.value })} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" />Warna Tema</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400 mb-2 block">Primer</label><div className="flex gap-2"><input type="color" className="w-12 h-12 rounded-xl cursor-pointer" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} /><input className="input-glass flex-1" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} /></div></div>
                                <div><label className="text-sm text-gray-400 mb-2 block">Aksen</label><div className="flex gap-2"><input type="color" className="w-12 h-12 rounded-xl cursor-pointer" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} /><input className="input-glass flex-1" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} /></div></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
