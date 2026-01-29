'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Shield, Save, Plus, Trash2, Edit2, ChevronLeft, Palette, Type, Gift, Package, Settings, Eye, Lock, Check, X, Home, Menu, FileText, Zap } from 'lucide-react'
import Link from 'next/link'

const ADMIN_PASSWORD = 'admin123laundry'

type SiteSettings = {
    // Hero Section
    hero_title: string
    hero_subtitle: string
    // Promo
    promo_text: string
    promo_enabled: boolean
    promo_description: string
    // Colors
    primary_color: string
    accent_color: string
    // Dashboard
    dashboard_title: string
    dashboard_merchant_prefix: string
    // Features
    feature_1_title: string
    feature_1_desc: string
    feature_2_title: string
    feature_2_desc: string
    feature_3_title: string
    feature_3_desc: string
    feature_4_title: string
    feature_4_desc: string
    // Service Types
    regular_label: string
    regular_price_per_kg: number
    regular_eta: string
    express_label: string
    express_price_per_kg: number
    express_eta: string
    express_enabled: boolean
}

type PlatformService = {
    id: string
    name: string
    description: string
    icon: string
    price: number
    unit_type: string
    category: string
    is_active: boolean
    sort_order: number
}

const DEFAULT_SETTINGS: SiteSettings = {
    hero_title: 'Cuci Bersih, Wangi Sempurna',
    hero_subtitle: 'Platform laundry paling canggih dengan deteksi lokasi otomatis, antar-jemput gratis, dan diskon hingga 20% untuk member.',
    promo_text: 'Diskon 20% untuk Member Baru!',
    promo_enabled: true,
    promo_description: 'Daftar sekarang dan nikmati potongan harga untuk setiap transaksi pertama.',
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
    express_enabled: true
}

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [activeTab, setActiveTab] = useState<'home' | 'content' | 'services' | 'settings'>('home')
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [services, setServices] = useState<PlatformService[]>([])
    const [editingService, setEditingService] = useState<PlatformService | null>(null)
    const [newService, setNewService] = useState<Partial<PlatformService>>({
        name: '', icon: '👕', price: 5000, unit_type: 'pcs', category: 'regular', is_active: true, description: ''
    })
    const [saving, setSaving] = useState(false)
    const [saveSuccess, setSaveSuccess] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        const auth = sessionStorage.getItem('admin_auth')
        if (auth === 'true') {
            setIsAuthenticated(true)
            loadData()
        }
    }, [])

    const handleLogin = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true)
            sessionStorage.setItem('admin_auth', 'true')
            setAuthError('')
            loadData()
        } else {
            setAuthError('Password salah!')
        }
    }

    const loadData = async () => {
        const { data: settingsData } = await supabase
            .from('site_settings')
            .select('*')
            .eq('id', 'main')
            .single()

        if (settingsData) {
            setSettings({ ...DEFAULT_SETTINGS, ...settingsData })
        }

        const { data: servicesData } = await supabase
            .from('platform_services')
            .select('*')
            .order('sort_order', { ascending: true })

        if (servicesData) {
            setServices(servicesData)
        }
    }

    const saveSettings = async () => {
        setSaving(true)
        const { error } = await supabase
            .from('site_settings')
            .upsert({ id: 'main', ...settings, updated_at: new Date().toISOString() })

        if (!error) {
            setSaveSuccess(true)
            setTimeout(() => setSaveSuccess(false), 2000)
        }
        setSaving(false)
    }

    const addService = async () => {
        if (!newService.name || !newService.price) return

        await supabase.from('platform_services').insert({
            ...newService,
            sort_order: services.length + 1
        })

        loadData()
        setNewService({ name: '', icon: '👕', price: 5000, unit_type: 'pcs', category: 'regular', is_active: true, description: '' })
    }

    const updateService = async (service: PlatformService) => {
        await supabase
            .from('platform_services')
            .update(service)
            .eq('id', service.id)

        loadData()
        setEditingService(null)
    }

    const deleteService = async (id: string) => {
        if (!confirm('Hapus layanan ini?')) return
        await supabase.from('platform_services').delete().eq('id', id)
        loadData()
    }

    const toggleServiceActive = async (service: PlatformService) => {
        await supabase
            .from('platform_services')
            .update({ is_active: !service.is_active })
            .eq('id', service.id)
        loadData()
    }

    // Login Screen
    if (!isAuthenticated) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
                </div>

                <div className="glass p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                            <Shield className="w-8 h-8 text-white" />
                        </div>
                        <h2 className="text-2xl font-bold text-white">Super Admin Panel</h2>
                        <p className="text-gray-400 mt-2">Kontrol penuh platform Laundry Terdekat</p>
                    </div>

                    {authError && (
                        <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-3 rounded-xl mb-4 text-sm text-center">
                            {authError}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                            <input
                                type="password"
                                className="input-glass w-full pl-12"
                                placeholder="Password Admin"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                        </div>
                        <button onClick={handleLogin} className="btn-gradient w-full py-4">
                            Masuk Admin
                        </button>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-8">
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-red-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-orange-500/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-6">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                            <ChevronLeft className="w-5 h-5" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center">
                                <Shield className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="font-bold text-lg text-white">Super Admin</h1>
                                <p className="text-xs text-gray-400">Full Control</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="btn-gradient py-2 px-4 flex items-center gap-2"
                    >
                        {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                        {saveSuccess ? 'Tersimpan!' : 'Simpan Semua'}
                    </button>
                </div>
            </header>

            <div className="px-4 max-w-5xl mx-auto">
                {/* Tabs */}
                <div className="glass p-2 flex gap-2 mb-6 overflow-x-auto">
                    {[
                        { id: 'home', label: 'Beranda', icon: Home },
                        { id: 'content', label: 'Konten', icon: FileText },
                        { id: 'services', label: 'Layanan', icon: Package },
                        { id: 'settings', label: 'Pengaturan', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id
                                    ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white'
                                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <tab.icon className="w-4 h-4" />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Home/Hero Section Tab */}
                {activeTab === 'home' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Type className="w-5 h-5 text-blue-400" />
                                Hero Section (Halaman Utama)
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Judul Utama</label>
                                    <input
                                        className="input-glass w-full"
                                        value={settings.hero_title}
                                        onChange={(e) => setSettings({ ...settings, hero_title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Deskripsi</label>
                                    <textarea
                                        className="input-glass w-full"
                                        rows={3}
                                        value={settings.hero_subtitle}
                                        onChange={(e) => setSettings({ ...settings, hero_subtitle: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Gift className="w-5 h-5 text-yellow-400" />
                                Promo Banner
                            </h3>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-300">Tampilkan Promo</span>
                                    <button
                                        onClick={() => setSettings({ ...settings, promo_enabled: !settings.promo_enabled })}
                                        className={`w-12 h-7 rounded-full transition relative ${settings.promo_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                                    >
                                        <div className={`absolute top-1 w-5 h-5 rounded-full bg-white transition ${settings.promo_enabled ? 'left-6' : 'left-1'}`} />
                                    </button>
                                </div>
                                <input
                                    className="input-glass w-full"
                                    placeholder="Teks Promo"
                                    value={settings.promo_text}
                                    onChange={(e) => setSettings({ ...settings, promo_text: e.target.value })}
                                />
                                <textarea
                                    className="input-glass w-full"
                                    rows={2}
                                    placeholder="Deskripsi Promo"
                                    value={settings.promo_description}
                                    onChange={(e) => setSettings({ ...settings, promo_description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Menu className="w-5 h-5 text-green-400" />
                                Fitur Unggulan (4 Box)
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((num) => (
                                    <div key={num} className="bg-white/5 p-4 rounded-xl space-y-2">
                                        <p className="text-xs text-gray-500">Fitur {num}</p>
                                        <input
                                            className="input-glass w-full text-sm"
                                            placeholder="Judul"
                                            value={(settings as any)[`feature_${num}_title`]}
                                            onChange={(e) => setSettings({ ...settings, [`feature_${num}_title`]: e.target.value })}
                                        />
                                        <input
                                            className="input-glass w-full text-sm"
                                            placeholder="Deskripsi"
                                            value={(settings as any)[`feature_${num}_desc`]}
                                            onChange={(e) => setSettings({ ...settings, [`feature_${num}_desc`]: e.target.value })}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Dashboard Pemesanan</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Judul Halaman Order</label>
                                    <input
                                        className="input-glass w-full"
                                        value={settings.dashboard_title}
                                        onChange={(e) => setSettings({ ...settings, dashboard_title: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Prefix Nama Outlet</label>
                                    <input
                                        className="input-glass w-full"
                                        placeholder="Contoh: Laundry Terdekat"
                                        value={settings.dashboard_merchant_prefix}
                                        onChange={(e) => setSettings({ ...settings, dashboard_merchant_prefix: e.target.value })}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Hasil: "{settings.dashboard_merchant_prefix} Jl. Sudirman No. 123"</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Zap className="w-5 h-5 text-yellow-400" />
                                Tipe Layanan (Reguler & Express)
                            </h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="bg-blue-500/10 p-4 rounded-xl border border-blue-500/30">
                                    <p className="text-blue-400 font-semibold mb-3">Reguler</p>
                                    <div className="space-y-3">
                                        <input
                                            className="input-glass w-full text-sm"
                                            placeholder="Label"
                                            value={settings.regular_label}
                                            onChange={(e) => setSettings({ ...settings, regular_label: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="input-glass flex-1 text-sm"
                                                type="number"
                                                placeholder="Harga/kg"
                                                value={settings.regular_price_per_kg}
                                                onChange={(e) => setSettings({ ...settings, regular_price_per_kg: Number(e.target.value) })}
                                            />
                                            <input
                                                className="input-glass flex-1 text-sm"
                                                placeholder="Estimasi"
                                                value={settings.regular_eta}
                                                onChange={(e) => setSettings({ ...settings, regular_eta: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-yellow-500/10 p-4 rounded-xl border border-yellow-500/30">
                                    <div className="flex justify-between items-center mb-3">
                                        <p className="text-yellow-400 font-semibold">Express ⚡</p>
                                        <button
                                            onClick={() => setSettings({ ...settings, express_enabled: !settings.express_enabled })}
                                            className={`w-10 h-6 rounded-full transition relative ${settings.express_enabled ? 'bg-green-500' : 'bg-gray-600'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition ${settings.express_enabled ? 'left-5' : 'left-1'}`} />
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        <input
                                            className="input-glass w-full text-sm"
                                            placeholder="Label"
                                            value={settings.express_label}
                                            onChange={(e) => setSettings({ ...settings, express_label: e.target.value })}
                                        />
                                        <div className="flex gap-2">
                                            <input
                                                className="input-glass flex-1 text-sm"
                                                type="number"
                                                placeholder="Harga/kg"
                                                value={settings.express_price_per_kg}
                                                onChange={(e) => setSettings({ ...settings, express_price_per_kg: Number(e.target.value) })}
                                            />
                                            <input
                                                className="input-glass flex-1 text-sm"
                                                placeholder="Estimasi"
                                                value={settings.express_eta}
                                                onChange={(e) => setSettings({ ...settings, express_eta: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Plus className="w-5 h-5 text-green-400" />
                                Tambah Layanan Baru
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <input
                                    className="input-glass col-span-2"
                                    placeholder="Nama Layanan"
                                    value={newService.name}
                                    onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                                />
                                <input
                                    className="input-glass"
                                    placeholder="Icon"
                                    value={newService.icon}
                                    onChange={(e) => setNewService({ ...newService, icon: e.target.value })}
                                />
                                <input
                                    className="input-glass"
                                    type="number"
                                    placeholder="Harga"
                                    value={newService.price}
                                    onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                                />
                                <select
                                    className="input-glass bg-gray-800 text-white"
                                    value={newService.unit_type}
                                    onChange={(e) => setNewService({ ...newService, unit_type: e.target.value })}
                                >
                                    <option value="pcs">Per Pcs</option>
                                    <option value="kg">Per Kg</option>
                                    <option value="mtr">Per Meter</option>
                                </select>
                            </div>
                            <button onClick={addService} className="btn-gradient mt-4 py-2 px-6">
                                <Plus className="w-4 h-4 inline mr-2" />
                                Tambah
                            </button>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Package className="w-5 h-5 text-blue-400" />
                                Daftar Layanan ({services.length})
                            </h3>
                            <div className="space-y-3">
                                {services.map((service) => (
                                    <div
                                        key={service.id}
                                        className={`p-4 rounded-xl border flex items-center gap-4 ${service.is_active
                                                ? 'bg-white/5 border-white/10'
                                                : 'bg-gray-800/50 border-gray-700 opacity-60'
                                            }`}
                                    >
                                        <div className="text-2xl">{service.icon}</div>

                                        {editingService?.id === service.id ? (
                                            <div className="flex-1 grid grid-cols-4 gap-2">
                                                <input
                                                    className="input-glass text-sm col-span-2"
                                                    value={editingService.name}
                                                    onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                                                />
                                                <input
                                                    className="input-glass text-sm"
                                                    type="number"
                                                    value={editingService.price}
                                                    onChange={(e) => setEditingService({ ...editingService, price: Number(e.target.value) })}
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateService(editingService)} className="p-2 bg-green-500/20 text-green-400 rounded-lg">
                                                        <Check className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => setEditingService(null)} className="p-2 bg-gray-500/20 text-gray-400 rounded-lg">
                                                        <X className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1">
                                                    <p className="font-medium text-white">{service.name}</p>
                                                    <p className="text-sm text-blue-400">
                                                        Rp {service.price.toLocaleString('id-ID')} / {service.unit_type}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <button
                                                        onClick={() => toggleServiceActive(service)}
                                                        className={`px-3 py-1 rounded-full text-xs font-medium ${service.is_active
                                                                ? 'bg-green-500/20 text-green-400'
                                                                : 'bg-gray-500/20 text-gray-400'
                                                            }`}
                                                    >
                                                        {service.is_active ? 'Aktif' : 'Off'}
                                                    </button>
                                                    <button onClick={() => setEditingService(service)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => deleteService(service.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                                {services.length === 0 && (
                                    <p className="text-center text-gray-500 py-8">Belum ada layanan. Tambahkan di atas.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2">
                                <Palette className="w-5 h-5 text-purple-400" />
                                Warna Tema
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Warna Primer</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-12 h-12 rounded-xl cursor-pointer"
                                            value={settings.primary_color}
                                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                        />
                                        <input
                                            className="input-glass flex-1"
                                            value={settings.primary_color}
                                            onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Warna Aksen</label>
                                    <div className="flex gap-2">
                                        <input
                                            type="color"
                                            className="w-12 h-12 rounded-xl cursor-pointer"
                                            value={settings.accent_color}
                                            onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                                        />
                                        <input
                                            className="input-glass flex-1"
                                            value={settings.accent_color}
                                            onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Preview</h3>
                            <div className="bg-gray-900 rounded-2xl p-6 border border-white/10">
                                <div className="text-center">
                                    <h2 className="text-xl font-bold mb-2" style={{ color: settings.primary_color }}>
                                        {settings.hero_title}
                                    </h2>
                                    <p className="text-gray-400 text-sm mb-4">{settings.hero_subtitle}</p>
                                    {settings.promo_enabled && (
                                        <div
                                            className="inline-block px-4 py-2 rounded-full text-white text-sm font-semibold"
                                            style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color})` }}
                                        >
                                            🎁 {settings.promo_text}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
