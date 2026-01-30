'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Truck, Clock, Shield, Star, ChevronRight, Zap, Gift, Navigation, Loader2, User, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

type SiteSettings = {
  hero_title: string
  hero_subtitle: string
  promo_text: string
  promo_enabled: boolean
  primary_color: string
  accent_color: string
  feature_1_title: string
  feature_1_desc: string
  feature_2_title: string
  feature_2_desc: string
  feature_3_title: string
  feature_3_desc: string
  feature_4_title: string
  feature_4_desc: string
  express_enabled: boolean
  express_label: string
  express_eta: string
  bg_theme: string
  custom_bg_url: string
  app_title: string
  app_logo: string
}

const DEFAULT_SETTINGS: SiteSettings = {
  hero_title: 'Cuci Bersih, Wangi Sempurna',
  hero_subtitle: 'Platform laundry paling canggih dengan deteksi lokasi otomatis, antar-jemput gratis, dan diskon hingga 20% untuk member.',
  promo_text: 'Diskon 20% untuk Member Baru!',
  promo_enabled: true,
  primary_color: '#3b82f6',
  accent_color: '#8b5cf6',
  feature_1_title: 'Terdekat',
  feature_1_desc: 'Outlet resmi di sekitarmu',
  feature_2_title: 'Antar Jemput',
  feature_2_desc: 'Gratis ongkir hingga 5km',
  feature_3_title: 'Cepat',
  feature_3_desc: 'Estimasi 24 jam selesai',
  feature_4_title: 'Aman',
  feature_4_desc: 'Garansi cucian hilang',
  express_enabled: true,
  express_label: 'Express (8 Jam)',
  express_eta: '8 jam',
  bg_theme: 'gradient',
  custom_bg_url: '',
  app_title: 'Laundry Terdekat',
  app_logo: ''
}

export default function Home() {
  const [location, setLocation] = useState<{ city: string; kelurahan: string } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const [user, setUser] = useState<any>(null)
  const [userLoading, setUserLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
    getLocation()
    checkUser()
  }, [])

  const checkUser = async () => {
    // First check if we have OAuth tokens from callback (for Capacitor)
    const storedTokens = localStorage.getItem('oauth_tokens')
    if (storedTokens) {
      try {
        const parsed = JSON.parse(storedTokens)
        // Only use if recent (within 5 minutes)
        if (Date.now() - parsed.timestamp < 5 * 60 * 1000) {
          const { error } = await supabase.auth.setSession({
            access_token: parsed.access_token,
            refresh_token: parsed.refresh_token
          })
          if (!error) {
            localStorage.removeItem('oauth_tokens')
          }
        } else {
          localStorage.removeItem('oauth_tokens')
        }
      } catch (e) {
        localStorage.removeItem('oauth_tokens')
      }
    }

    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
    setUserLoading(false)
  }

  const loadSettings = async () => {
    // Try localStorage first (set by admin panel)
    const localSettings = localStorage.getItem('laundry_settings')
    if (localSettings) {
      try {
        const parsed = JSON.parse(localSettings)
        setSettings({ ...DEFAULT_SETTINGS, ...parsed })
      } catch { }
    }

    // Then try Supabase (will override if successful)
    try {
      const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
      if (data) {
        setSettings({ ...DEFAULT_SETTINGS, ...data })
        localStorage.setItem('laundry_settings', JSON.stringify(data))
      }
    } catch { }
  }

  const getLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1&zoom=18`)
            const data = await response.json()
            const addr = data.address || {}
            setLocation({ city: addr.city || addr.town || addr.state || 'Yogyakarta', kelurahan: addr.suburb || addr.village || addr.neighbourhood || 'Kelurahan' })
          } catch {
            setLocation({ city: 'Yogyakarta', kelurahan: 'Sosromenduran' })
          }
          setIsLocating(false)
        },
        () => {
          setLocation({ city: 'Yogyakarta', kelurahan: 'Sosromenduran' })
          setIsLocating(false)
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      )
    }
  }

  const getBackground = () => {
    switch (settings.bg_theme) {
      case 'photo': return { backgroundImage: 'url(/bg-hero.png)', backgroundSize: 'cover', backgroundPosition: 'center' }
      case 'custom': return settings.custom_bg_url ? { backgroundImage: `url(${settings.custom_bg_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}
      case 'dark': return { background: '#0a0a0a' }
      case 'blue': return { background: 'linear-gradient(135deg, #0c4a6e, #164e63)' }
      case 'purple': return { background: 'linear-gradient(135deg, #4c1d95, #581c87)' }
      default: return {}
    }
  }

  const needsOverlay = settings.bg_theme === 'photo' || settings.bg_theme === 'custom'

  const featureIcons = [MapPin, Truck, Clock, Shield]
  const featureColors = ['from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500', 'from-orange-500 to-yellow-500', 'from-green-500 to-emerald-500']

  return (
    <main className="min-h-screen pb-32">
      {/* Background */}
      <div className="fixed inset-0 -z-10">
        {settings.bg_theme === 'image' && settings.custom_bg_url ? (
          <><div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${settings.custom_bg_url})` }} /><div className="absolute inset-0 bg-black/60" /></>
        ) : (
          <><div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900/20 to-slate-900" /><div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" /><div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" /></>
        )}
      </div>

      {/* Header */}
      <header className="px-4 py-6 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-3 ml-12">
          {settings.app_logo ? (
            <img src={settings.app_logo} alt={settings.app_title} className="w-10 h-10 rounded-xl object-cover" />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
          )}
          <span className="font-bold text-xl">{settings.app_title}</span>
        </div>
        <div className="glass px-4 py-2 rounded-full flex items-center gap-2 text-sm">
          {isLocating ? <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> : <Navigation className="w-4 h-4 text-blue-400" />}
          <span className="text-gray-300">{location ? location.city : 'Detecting...'}</span>
        </div>
      </header>

      {/* Hero */}
      <section className="px-4 py-8 md:py-16 max-w-6xl mx-auto">
        <div className="glass p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 md:w-80 md:h-80 bg-gradient-to-br from-blue-500/30 to-purple-500/30 rounded-full blur-3xl" />
          <div className="relative z-10">
            <span className="inline-flex items-center gap-2 text-blue-400 text-sm font-medium mb-4"><Sparkles className="w-4 h-4" />Platform Laundry #1</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">{settings.hero_title}</h1>
            <p className="text-gray-400 text-lg mb-8 max-w-2xl">{settings.hero_subtitle}</p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order" className="btn-gradient px-8 py-4 text-lg flex items-center gap-2"><MapPin className="w-5 h-5" />Cari Laundry</Link>
              <Link href="/orders" className="glass px-8 py-4 text-lg hover:bg-white/10 transition">Lacak Pesanan</Link>
            </div>
            {location && (<div className="mt-8 flex items-center gap-3 text-sm text-gray-400"><MapPin className="w-4 h-4 text-green-400" /><span>Lokasi terdeteksi: <strong className="text-white">{location.kelurahan}, {location.city}</strong></span></div>)}
          </div>
        </div>
      </section>

      {/* Express Promo */}
      {settings.express_enabled && (
        <section className="px-4 py-4 max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/20 via-yellow-500/20 to-orange-500/20 border border-yellow-500/30">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(250,204,21,0.15),transparent)]" />
            <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center flex-shrink-0"><Zap className="w-10 h-10 text-white" /></div>
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-yellow-300 mb-2">⚡ {settings.express_label}</h3>
                <p className="text-yellow-100/80">Butuh cepat? Layanan Express selesai dalam {settings.express_eta}!</p>
              </div>
              <Link href="/order" className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold px-8 py-4 rounded-2xl hover:opacity-90 transition">Order Express</Link>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-12 gradient-text">Kenapa Pilih Kami?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[1, 2, 3, 4].map((num, i) => {
            const Icon = featureIcons[i]
            return (
              <div key={num} className="glass p-6 card-hover text-center">
                <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${featureColors[i]} flex items-center justify-center`}><Icon className="w-7 h-7 text-white" /></div>
                <h4 className="font-bold text-white mb-1">{(settings as any)[`feature_${num}_title`]}</h4>
                <p className="text-sm text-gray-400">{(settings as any)[`feature_${num}_desc`]}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Services */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold gradient-text">Layanan Populer</h3>
          <Link href="/order" className="text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">Lihat Semua <ChevronRight className="w-4 h-4" /></Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Cuci Satuan', price: 'Rp 5.000', unit: '/pcs', img: '👕' },
            { name: 'Cuci Kiloan', price: 'Rp 7.000', unit: '/kg', img: '🧺', tag: 'Hemat' },
            { name: 'Express 8 Jam', price: 'Rp 15.000', unit: '/kg', img: '⚡', tag: 'Cepat' },
          ].map((s, i) => (
            <div key={i} className="glass p-6 card-hover relative overflow-hidden">
              {s.tag && <span className="absolute top-4 right-4 badge-discount">{s.tag}</span>}
              <div className="text-5xl mb-4">{s.img}</div>
              <h4 className="font-bold text-xl text-white mb-2">{s.name}</h4>
              <div className="flex items-baseline gap-1"><span className="text-2xl font-bold gradient-text">{s.price}</span><span className="text-gray-400">{s.unit}</span></div>
            </div>
          ))}
        </div>
      </section>

      {/* Promo - Show different content based on login status */}
      {settings.promo_enabled && (
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color}, #ec4899)` }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              {userLoading ? (
                <div className="flex items-center justify-center py-8"><Loader2 className="w-8 h-8 animate-spin text-white" /></div>
              ) : user ? (
                // User is logged in - show member promo
                <>
                  <div className="flex items-center gap-2 mb-4"><CheckCircle className="w-6 h-6 text-green-300" /><span className="text-green-300 font-semibold">Member Aktif</span></div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Selamat, {user.user_metadata?.full_name || user.email?.split('@')[0]}! 🎉</h3>
                  <p className="text-white/80 mb-6 max-w-xl">Kamu berhak mendapat diskon 20% untuk semua layanan. Gunakan sekarang!</p>
                  <Link href="/order" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition"><Zap className="w-5 h-5" />Order Sekarang</Link>
                </>
              ) : (
                // User not logged in - show register promo
                <>
                  <div className="flex items-center gap-2 mb-4"><Star className="w-6 h-6 text-yellow-300" /><span className="text-yellow-300 font-semibold">Penawaran Spesial</span></div>
                  <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{settings.promo_text}</h3>
                  <p className="text-white/80 mb-6 max-w-xl">Daftar sekarang dan nikmati potongan harga eksklusif!</p>
                  <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition"><Gift className="w-5 h-5" />Daftar Gratis</Link>
                </>
              )}
            </div>
          </div>
        </section>
      )}

      {/* Navigation - Updated to check login status */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto glass-bright py-4 px-6 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center text-blue-400"><Sparkles className="w-6 h-6" /><span className="text-xs mt-1 font-medium">Beranda</span></Link>
        <Link href="/order" className="flex flex-col items-center text-gray-400 hover:text-white transition"><MapPin className="w-6 h-6" /><span className="text-xs mt-1">Cari</span></Link>
        <Link href="/order" className="relative -mt-8 bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-blue-500/30"><Zap className="w-7 h-7 text-white" /></Link>
        <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-white transition"><Clock className="w-6 h-6" /><span className="text-xs mt-1">Pesanan</span></Link>
        {user ? (
          <Link href="/account" className="flex flex-col items-center text-gray-400 hover:text-white transition"><User className="w-6 h-6" /><span className="text-xs mt-1">Akun</span></Link>
        ) : (
          <Link href="/register" className="flex flex-col items-center text-gray-400 hover:text-white transition"><Gift className="w-6 h-6" /><span className="text-xs mt-1">Promo</span></Link>
        )}
      </nav>
    </main>
  )
}
