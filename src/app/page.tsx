'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Truck, Clock, Shield, Star, ChevronRight, Zap, Gift, Navigation, Loader2 } from 'lucide-react'
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
  custom_bg_url: ''
}

export default function Home() {
  const [location, setLocation] = useState<{ city: string; kelurahan: string } | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
  const supabase = createClient()

  useEffect(() => {
    loadSettings()
    getLocation()
  }, [])

  const loadSettings = async () => {
    const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
    if (data) setSettings({ ...DEFAULT_SETTINGS, ...data })
  }

  const getLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1`)
            const data = await response.json()
            const addr = data.address || {}
            setLocation({ city: addr.city || addr.town || 'Jakarta', kelurahan: addr.suburb || addr.village || 'Kelurahan' })
          } catch {
            setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng' })
          }
          setIsLocating(false)
        },
        () => { setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng' }); setIsLocating(false) }
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
  const featureColors = ['from-blue-500 to-cyan-400', 'from-green-500 to-emerald-400', 'from-orange-500 to-yellow-400', 'from-purple-500 to-pink-400']

  return (
    <main className="min-h-screen pb-32 relative">
      {/* Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden" style={getBackground()}>
        {settings.bg_theme === 'gradient' && (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />
            <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
          </>
        )}
        {needsOverlay && <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-slate-900" />}
      </div>

      {/* Hero Section - NO ADMIN LINK */}
      <section className="relative pt-8 px-4 md:pt-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center floating" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color})` }}>
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Laundry Terdekat</h1>
          </div>

          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight text-white">{settings.hero_title}</h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-8">{settings.hero_subtitle}</p>

          <div className="glass p-6 max-w-lg mx-auto mb-8 text-left">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center location-pulse">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Lokasi Anda</p>
                <p className="font-semibold text-white">{isLocating ? <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Mendeteksi...</span> : `${location?.kelurahan}, ${location?.city}`}</p>
              </div>
              <button onClick={getLocation} className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"><Navigation className="w-5 h-5" /></button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/order" className="btn-gradient text-lg flex items-center gap-2 pulse-glow"><Zap className="w-5 h-5" />Order Sekarang<ChevronRight className="w-5 h-5" /></Link>
            <Link href="/register" className="glass px-8 py-4 rounded-2xl font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2"><Gift className="w-5 h-5 text-yellow-400" />Daftar & Dapat Diskon 20%</Link>
          </div>
        </div>
      </section>

      {/* Express Promo */}
      {settings.express_enabled && (
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-3xl p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-6">
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

      {/* Promo */}
      {settings.promo_enabled && (
        <section className="px-4 py-8 max-w-4xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-8 md:p-12" style={{ background: `linear-gradient(135deg, ${settings.primary_color}, ${settings.accent_color}, #ec4899)` }}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4"><Star className="w-6 h-6 text-yellow-300" /><span className="text-yellow-300 font-semibold">Penawaran Spesial</span></div>
              <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">{settings.promo_text}</h3>
              <p className="text-white/80 mb-6 max-w-xl">Daftar sekarang dan nikmati potongan harga eksklusif!</p>
              <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition"><Gift className="w-5 h-5" />Daftar Gratis</Link>
            </div>
          </div>
        </section>
      )}

      {/* Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto glass-bright py-4 px-6 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center text-blue-400"><Sparkles className="w-6 h-6" /><span className="text-xs mt-1 font-medium">Beranda</span></Link>
        <Link href="/order" className="flex flex-col items-center text-gray-400 hover:text-white transition"><MapPin className="w-6 h-6" /><span className="text-xs mt-1">Cari</span></Link>
        <Link href="/order" className="relative -mt-8 bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-blue-500/30"><Zap className="w-7 h-7 text-white" /></Link>
        <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-white transition"><Clock className="w-6 h-6" /><span className="text-xs mt-1">Pesanan</span></Link>
        <Link href="/register" className="flex flex-col items-center text-gray-400 hover:text-white transition"><Gift className="w-6 h-6" /><span className="text-xs mt-1">Promo</span></Link>
      </nav>
    </main>
  )
}
