'use client'

import { useState, useEffect, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Shield, Save, Plus, Trash2, Edit2, ChevronLeft, Palette, Type, Gift, Package, Lock, Check, X, Home, FileText, Zap, Image, Layout, Upload, RefreshCw, AlertCircle } from 'lucide-react'
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

const DEFAULT_SETTINGS: SiteSettings = {
    hero_title: 'Cuci Bersih, Wangi Sempurna',
    hero_subtitle: 'Platform laundry paling canggih dengan deteksi lokasi otomatis, antar-jemput gratis, dan diskon hingga 20% untuk member.',
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

export default function AdminPage() {
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [password, setPassword] = useState('')
    const [authError, setAuthError] = useState('')
    const [activeTab, setActiveTab] = useState<'home' | 'content' | 'services' | 'theme' | 'settings'>('theme')
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [services, setServices] = useState<PlatformService[]>([])
    const [editingService, setEditingService] = useState<PlatformService | null>(null)
    const [newService, setNewService] = useState<Partial<PlatformService>>({ name: '', icon: '👕', price: 5000, unit_type: 'pcs', is_active: true })
    const [saving, setSaving] = useState(false)
    const [status, setStatus] = useState({ type: '', msg: '' })
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
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
        if (type === 'success') {
            setTimeout(() => setStatus({ type: '', msg: '' }), 3000)
        }
    }

    const loadData = async () => {
        showStatus('info', 'Loading data...')

        // Try localStorage first
        const localSettings = localStorage.getItem('laundry_settings')
        if (localSettings) {
            try {
                const parsed = JSON.parse(localSettings)
                setSettings({ ...DEFAULT_SETTINGS, ...parsed })
                showStatus('info', 'Loaded from local storage')
            } catch { }
        }

        // Then try Supabase
        try {
            const { data: s, error } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
            if (error) {
                showStatus('error', 'Database error: ' + error.message + '. Using local storage.')
            } else if (s) {
                setSettings({ ...DEFAULT_SETTINGS, ...s })
                localStorage.setItem('laundry_settings', JSON.stringify(s))
                showStatus('success', 'Data loaded from database')
            }
        } catch (err: any) {
            showStatus('error', 'Failed to connect: ' + err.message)
        }

        // Load services
        try {
            const { data: svc } = await supabase.from('platform_services').select('*').order('sort_order')
            if (svc) setServices(svc)
        } catch { }
    }

    const saveSettings = async () => {
        setSaving(true)
        showStatus('info', 'Saving...')

        // Always save to localStorage first
        localStorage.setItem('laundry_settings', JSON.stringify(settings))

        // Try Supabase
        try {
            const { error } = await supabase.from('site_settings').upsert({
                id: 'main',
                ...settings,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

            if (error) {
                showStatus('error', 'DB save failed: ' + error.message + '. Saved locally.')
            } else {
                showStatus('success', '✅ Saved to database!')
            }
        } catch (err: any) {
            showStatus('error', 'Error: ' + err.message + '. Saved locally.')
        }

        setSaving(false)
    }

    const selectTheme = async (themeId: string) => {
        const newSettings = { ...settings, bg_theme: themeId }
        setSettings(newSettings)

        // Save to localStorage immediately
        localStorage.setItem('laundry_settings', JSON.stringify(newSettings))
        showStatus('info', 'Saving theme: ' + themeId + '...')

        // Try Supabase
        try {
            const { error } = await supabase.from('site_settings').upsert({
                id: 'main',
                bg_theme: themeId,
                updated_at: new Date().toISOString()
            }, { onConflict: 'id' })

            if (error) {
                showStatus('error', 'DB error: ' + error.message + '. Saved locally.')
            } else {
                showStatus('success', '✅ Theme saved: ' + themeId)
            }
        } catch (err: any) {
            showStatus('error', 'Error: ' + err.message + '. Saved locally.')
        }
    }

    const handleBgUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (!file.type.startsWith('image/')) {
            showStatus('error', 'File harus berupa gambar')
            return
        }
        if (file.size > 5 * 1024 * 1024) {
            showStatus('error', 'Maksimal 5MB')
            return
        }

        setUploading(true)
        showStatus('info', 'Uploading...')

        const reader = new FileReader()
        reader.onload = async () => {
            const base64 = reader.result as string
            const newSettings = { ...settings, custom_bg_url: base64, bg_theme: 'custom' }
            setSettings(newSettings)

            // Save to localStorage
            localStorage.setItem('laundry_settings', JSON.stringify(newSettings))

            // Try Supabase
            try {
                const { error } = await supabase.from('site_settings').upsert({
                    id: 'main',
                    custom_bg_url: base64,
                    bg_theme: 'custom',
                    updated_at: new Date().toISOString()
                }, { onConflict: 'id' })

                if (error) {
                    showStatus('error', 'DB error: ' + error.message + '. Saved locally.')
                } else {
                    showStatus('success', '✅ Background uploaded!')
                }
            } catch (err: any) {
                showStatus('error', 'Error: ' + err.message + '. Saved locally.')
            }

            setUploading(false)
        }
        reader.onerror = () => {
            showStatus('error', 'Failed to read file')
            setUploading(false)
        }
        reader.readAsDataURL(file)
    }

    const removeCustomBg = () => {
        const newSettings = { ...settings, custom_bg_url: '', bg_theme: 'gradient' }
        setSettings(newSettings)
        localStorage.setItem('laundry_settings', JSON.stringify(newSettings))
        selectTheme('gradient')
    }

    const addService = async () => {
        if (!newService.name) return
        await supabase.from('platform_services').insert({ ...newService, sort_order: services.length + 1 })
        loadData()
        setNewService({ name: '', icon: '👕', price: 5000, unit_type: 'pcs', is_active: true })
    }

    const updateService = async (s: PlatformService) => {
        await supabase.from('platform_services').update(s).eq('id', s.id)
        loadData()
        setEditingService(null)
    }

    const deleteService = async (id: string) => {
        if (!confirm('Hapus?')) return
        await supabase.from('platform_services').delete().eq('id', id)
        loadData()
    }

    const toggleActive = async (s: PlatformService) => {
        await supabase.from('platform_services').update({ is_active: !s.is_active }).eq('id', s.id)
        loadData()
    }

    // Login
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

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4 mb-4">
                <div className="max-w-5xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><ChevronLeft className="w-5 h-5" /></Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center"><Shield className="w-5 h-5 text-white" /></div>
                            <div><h1 className="font-bold text-lg text-white">Super Admin <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full ml-2">v2.2 FINAL</span></h1></div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={loadData} className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><RefreshCw className="w-5 h-5" /></button>
                        <button onClick={saveSettings} disabled={saving} className="btn-gradient py-2 px-4 flex items-center gap-2">
                            {saving ? 'Saving...' : <><Save className="w-4 h-4" />Simpan</>}
                        </button>
                    </div>
                </div>
            </header>

            {/* Status Message */}
            {status.msg && (
                <div className="px-4 max-w-5xl mx-auto mb-4">
                    <div className={`p-4 rounded-xl flex items-center gap-3 ${status.type === 'error' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                        status.type === 'success' ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                            'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                        {status.type === 'error' && <AlertCircle className="w-5 h-5" />}
                        {status.type === 'success' && <Check className="w-5 h-5" />}
                        <span>{status.msg}</span>
                    </div>
                </div>
            )}

            <div className="px-4 max-w-5xl mx-auto">
                {/* Tabs */}
                <div className="glass p-2 flex gap-2 mb-6 overflow-x-auto">
                    {[
                        { id: 'theme', label: 'Tema', icon: Layout },
                        { id: 'home', label: 'Beranda', icon: Home },
                        { id: 'content', label: 'Konten', icon: FileText },
                        { id: 'services', label: 'Layanan', icon: Package },
                        { id: 'settings', label: 'Warna', icon: Palette },
                    ].map((tab) => (
                        <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} className={`flex-1 py-3 px-4 rounded-xl font-medium transition flex items-center justify-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-gradient-to-r from-red-500 to-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
                            <tab.icon className="w-4 h-4" />{tab.label}
                        </button>
                    ))}
                </div>

                {/* Theme Tab - FIRST TAB NOW */}
                {activeTab === 'theme' && (
                    <div className="space-y-6">
                        {/* Upload Section */}
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                                <Upload className="w-6 h-6 text-green-400" />
                                Upload Background Custom
                            </h3>
                            <div className="space-y-4">
                                <input type="file" ref={fileInputRef} accept="image/*" className="hidden" onChange={handleBgUpload} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={uploading}
                                    className="w-full flex items-center justify-center gap-4 p-8 border-2 border-dashed border-white/30 rounded-2xl hover:border-green-500/50 hover:bg-white/5 transition cursor-pointer"
                                >
                                    <Upload className={`w-10 h-10 ${uploading ? 'text-gray-500 animate-pulse' : 'text-green-400'}`} />
                                    <div className="text-left">
                                        <p className="text-white font-bold text-lg">{uploading ? 'Mengupload...' : 'Klik untuk upload gambar'}</p>
                                        <p className="text-gray-400">JPG, PNG (Max 5MB)</p>
                                    </div>
                                </button>

                                {settings.custom_bg_url && (
                                    <div className="relative rounded-2xl overflow-hidden border-2 border-green-500/30">
                                        <img src={settings.custom_bg_url} alt="Custom" className="w-full h-48 object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                                            <button onClick={removeCustomBg} className="bg-red-500 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-bold">
                                                <Trash2 className="w-5 h-5" /> Hapus
                                            </button>
                                        </div>
                                        <div className="absolute top-3 left-3 bg-green-500 text-white text-sm px-3 py-1 rounded-full font-bold">✓ Custom Active</div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Theme Options */}
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-4 flex items-center gap-2">
                                <Image className="w-6 h-6 text-purple-400" />
                                Pilih Tema Background
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {BG_THEMES.map((theme) => (
                                    <button
                                        key={theme.id}
                                        onClick={() => theme.id !== 'custom' && selectTheme(theme.id)}
                                        disabled={theme.id === 'custom' && !settings.custom_bg_url}
                                        className={`p-4 rounded-2xl border-3 transition ${settings.bg_theme === theme.id
                                            ? 'border-green-500 ring-4 ring-green-500/30 bg-green-500/10'
                                            : 'border-white/20 hover:border-white/40'
                                            } ${theme.id === 'custom' && !settings.custom_bg_url ? 'opacity-40 cursor-not-allowed' : ''}`}
                                    >
                                        <div
                                            className="w-full h-24 rounded-xl mb-3"
                                            style={{
                                                background: theme.id === 'custom'
                                                    ? (settings.custom_bg_url ? `url(${settings.custom_bg_url})` : '#333')
                                                    : theme.preview,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center'
                                            }}
                                        />
                                        <p className="font-bold text-white text-sm">{theme.name}</p>
                                        {settings.bg_theme === theme.id && <p className="text-green-400 text-xs mt-1 font-bold">✓ AKTIF</p>}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Preview */}
                        <div className="glass p-6">
                            <h3 className="font-bold text-xl text-white mb-4">Preview Background</h3>
                            <div
                                className="rounded-2xl overflow-hidden h-56 relative"
                                style={{
                                    background: settings.bg_theme === 'custom' && settings.custom_bg_url
                                        ? `url(${settings.custom_bg_url})`
                                        : BG_THEMES.find(t => t.id === settings.bg_theme)?.preview || BG_THEMES[0].preview,
                                    backgroundSize: 'cover',
                                    backgroundPosition: 'center'
                                }}
                            >
                                {settings.bg_theme === 'custom' && <div className="absolute inset-0 bg-black/50" />}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center p-6">
                                        <p className="text-3xl font-bold text-white mb-2">{settings.hero_title}</p>
                                        <p className="text-gray-300">{settings.hero_subtitle.substring(0, 80)}...</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Home Tab */}
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
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Fitur (4 Box)</h3>
                            <div className="grid md:grid-cols-2 gap-4">
                                {[1, 2, 3, 4].map((n) => (
                                    <div key={n} className="bg-white/5 p-4 rounded-xl space-y-2">
                                        <p className="text-xs text-gray-500">Fitur {n}</p>
                                        <input className="input-glass w-full text-sm" value={(settings as any)[`feature_${n}_title`]} onChange={(e) => setSettings({ ...settings, [`feature_${n}_title`]: e.target.value })} placeholder="Judul" />
                                        <input className="input-glass w-full text-sm" value={(settings as any)[`feature_${n}_desc`]} onChange={(e) => setSettings({ ...settings, [`feature_${n}_desc`]: e.target.value })} placeholder="Deskripsi" />
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
                            <h3 className="font-bold text-lg text-white mb-4">Dashboard Order</h3>
                            <div className="space-y-4">
                                <div><label className="text-sm text-gray-400 mb-2 block">Judul</label><input className="input-glass w-full" value={settings.dashboard_title} onChange={(e) => setSettings({ ...settings, dashboard_title: e.target.value })} /></div>
                                <div><label className="text-sm text-gray-400 mb-2 block">Prefix Outlet</label><input className="input-glass w-full" value={settings.dashboard_merchant_prefix} onChange={(e) => setSettings({ ...settings, dashboard_merchant_prefix: e.target.value })} /></div>
                            </div>
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

                {/* Services Tab */}
                {activeTab === 'services' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4"><Plus className="w-5 h-5 text-green-400 inline mr-2" />Tambah Layanan</h3>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <input className="input-glass col-span-2" placeholder="Nama" value={newService.name} onChange={(e) => setNewService({ ...newService, name: e.target.value })} />
                                <input className="input-glass" placeholder="Icon" value={newService.icon} onChange={(e) => setNewService({ ...newService, icon: e.target.value })} />
                                <input className="input-glass" type="number" placeholder="Harga" value={newService.price} onChange={(e) => setNewService({ ...newService, price: +e.target.value })} />
                                <select className="input-glass bg-gray-800 text-white" value={newService.unit_type} onChange={(e) => setNewService({ ...newService, unit_type: e.target.value })}>
                                    <option value="pcs">Per Pcs</option><option value="kg">Per Kg</option>
                                </select>
                            </div>
                            <button onClick={addService} className="btn-gradient mt-4 py-2 px-6"><Plus className="w-4 h-4 inline mr-2" />Tambah</button>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4"><Package className="w-5 h-5 text-blue-400 inline mr-2" />Daftar ({services.length})</h3>
                            <div className="space-y-3">
                                {services.map((s) => (
                                    <div key={s.id} className={`p-4 rounded-xl border flex items-center gap-4 ${s.is_active ? 'bg-white/5 border-white/10' : 'bg-gray-800/50 border-gray-700 opacity-60'}`}>
                                        <span className="text-2xl">{s.icon}</span>
                                        {editingService?.id === s.id ? (
                                            <div className="flex-1 grid grid-cols-4 gap-2">
                                                <input className="input-glass text-sm col-span-2" value={editingService.name} onChange={(e) => setEditingService({ ...editingService, name: e.target.value })} />
                                                <input className="input-glass text-sm" type="number" value={editingService.price} onChange={(e) => setEditingService({ ...editingService, price: +e.target.value })} />
                                                <div className="flex gap-2">
                                                    <button onClick={() => updateService(editingService)} className="p-2 bg-green-500/20 text-green-400 rounded-lg"><Check className="w-4 h-4" /></button>
                                                    <button onClick={() => setEditingService(null)} className="p-2 bg-gray-500/20 text-gray-400 rounded-lg"><X className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex-1"><p className="font-medium text-white">{s.name}</p><p className="text-sm text-blue-400">Rp {s.price.toLocaleString()} / {s.unit_type}</p></div>
                                                <div className="flex items-center gap-2">
                                                    <button onClick={() => toggleActive(s)} className={`px-3 py-1 rounded-full text-xs ${s.is_active ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>{s.is_active ? 'Aktif' : 'Off'}</button>
                                                    <button onClick={() => setEditingService(s)} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><Edit2 className="w-4 h-4" /></button>
                                                    <button onClick={() => deleteService(s.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Color Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="space-y-6">
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4 flex items-center gap-2"><Palette className="w-5 h-5 text-purple-400" />Warna Tema</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="text-sm text-gray-400 mb-2 block">Primer</label><div className="flex gap-2"><input type="color" className="w-12 h-12 rounded-xl cursor-pointer" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} /><input className="input-glass flex-1" value={settings.primary_color} onChange={(e) => setSettings({ ...settings, primary_color: e.target.value })} /></div></div>
                                <div><label className="text-sm text-gray-400 mb-2 block">Aksen</label><div className="flex gap-2"><input type="color" className="w-12 h-12 rounded-xl cursor-pointer" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} /><input className="input-glass flex-1" value={settings.accent_color} onChange={(e) => setSettings({ ...settings, accent_color: e.target.value })} /></div></div>
                            </div>
                        </div>
                        <div className="glass p-6">
                            <h3 className="font-bold text-lg text-white mb-4">Preview Tombol</h3>
                            <div className="flex gap-4 flex-wrap">
                                <button className="px-8 py-3 rounded-xl font-semibold text-white" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color})` }}>Order Sekarang</button>
                                <button className="px-8 py-3 rounded-xl font-semibold" style={{ border: `2px solid ${settings.primary_color}`, color: settings.primary_color }}>Lihat Promo</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </main>
    )
}
