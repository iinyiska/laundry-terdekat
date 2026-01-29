'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, Sparkles, Truck, Clock, Shield, Star, ChevronRight, Zap, Gift, Navigation } from 'lucide-react'

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const getLocation = () => {
    setIsLocating(true)
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords
          // Reverse geocoding mock (in production, use Google/Mapbox API)
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          })
          setIsLocating(false)
        },
        () => {
          setLocation({ lat: -6.1751, lng: 106.8650, address: 'Jakarta, Indonesia' })
          setIsLocating(false)
        }
      )
    }
  }

  useEffect(() => {
    getLocation()
  }, [])

  return (
    <main className="min-h-screen pb-32">
      {/* Ambient Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[150px]"></div>
      </div>

      {/* Hero Section */}
      <section className="relative pt-8 px-4 md:pt-16">
        <div className="max-w-4xl mx-auto text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center floating">
              <Sparkles className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold gradient-text">Laundry Terdekat</h1>
          </div>

          {/* Headline */}
          <h2 className="text-4xl md:text-6xl font-extrabold mb-6 leading-tight">
            Cuci Bersih, <span className="gradient-text">Wangi Sempurna</span>
            <br />dalam Genggaman
          </h2>

          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Platform laundry paling canggih dengan deteksi lokasi otomatis,
            antar-jemput gratis, dan diskon hingga <span className="text-yellow-400 font-semibold">20%</span> untuk member.
          </p>

          {/* Location Card */}
          <div className="glass p-6 max-w-lg mx-auto mb-8 text-left">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center location-pulse">
                <MapPin className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-400 mb-1">Lokasi Anda Terdeteksi</p>
                <p className="font-semibold text-white">
                  {isLocating ? 'Mendeteksi lokasi...' : location?.address || 'Aktifkan GPS'}
                </p>
              </div>
              <button
                onClick={getLocation}
                className="p-3 rounded-xl bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition"
              >
                <Navigation className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/order" className="btn-gradient text-lg flex items-center gap-2 pulse-glow">
              <Zap className="w-5 h-5" />
              Mulai Laundry Sekarang
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link href="/register" className="glass px-8 py-4 rounded-2xl font-semibold text-gray-300 hover:text-white hover:bg-white/10 transition flex items-center gap-2">
              <Gift className="w-5 h-5 text-yellow-400" />
              Daftar & Dapat Diskon 20%
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="px-4 py-16 max-w-6xl mx-auto">
        <h3 className="text-2xl font-bold text-center mb-12 gradient-text">Kenapa Pilih Kami?</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {[
            { icon: MapPin, title: 'Terdekat', desc: 'Mitra laundry di sekitarmu', color: 'from-blue-500 to-cyan-400' },
            { icon: Truck, title: 'Antar Jemput', desc: 'Gratis ongkir hingga 5km', color: 'from-green-500 to-emerald-400' },
            { icon: Clock, title: 'Cepat', desc: 'Estimasi 24 jam selesai', color: 'from-orange-500 to-yellow-400' },
            { icon: Shield, title: 'Aman', desc: 'Garansi cucian hilang', color: 'from-purple-500 to-pink-400' },
          ].map((feature, i) => (
            <div key={i} className="glass p-6 card-hover text-center">
              <div className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              <h4 className="font-bold text-white mb-1">{feature.title}</h4>
              <p className="text-sm text-gray-400">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services Preview */}
      <section className="px-4 py-8 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold gradient-text">Layanan Populer</h3>
          <Link href="/order" className="text-blue-400 font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Lihat Semua <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { name: 'Cuci Kering Satuan', price: 'Rp 5.000', unit: '/kg', popular: true, img: '👕' },
            { name: 'Cuci Setrika Premium', price: 'Rp 8.000', unit: '/kg', popular: false, img: '👔' },
            { name: 'Dry Clean Jas/Blazer', price: 'Rp 35.000', unit: '/pcs', popular: true, img: '🧥' },
          ].map((service, i) => (
            <div key={i} className="glass p-6 card-hover relative overflow-hidden">
              {service.popular && (
                <span className="absolute top-4 right-4 badge-discount">Favorit</span>
              )}
              <div className="text-5xl mb-4">{service.img}</div>
              <h4 className="font-bold text-xl text-white mb-2">{service.name}</h4>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold gradient-text">{service.price}</span>
                <span className="text-gray-400">{service.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Discount Banner */}
      <section className="px-4 py-8 max-w-4xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-4">
              <Star className="w-6 h-6 text-yellow-300" />
              <span className="text-yellow-300 font-semibold">Penawaran Spesial</span>
            </div>
            <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
              Diskon 20% untuk Member Baru!
            </h3>
            <p className="text-white/80 mb-6 max-w-xl">
              Daftar sekarang dan nikmati potongan harga untuk setiap transaksi pertama.
              Gratis ongkir juga lho!
            </p>
            <Link href="/register" className="inline-flex items-center gap-2 bg-white text-purple-600 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition">
              <Gift className="w-5 h-5" />
              Daftar Gratis Sekarang
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto glass-bright py-4 px-6 flex justify-around items-center z-50">
        <Link href="/" className="flex flex-col items-center text-blue-400">
          <Sparkles className="w-6 h-6" />
          <span className="text-xs mt-1 font-medium">Beranda</span>
        </Link>
        <Link href="/order" className="flex flex-col items-center text-gray-400 hover:text-white transition">
          <MapPin className="w-6 h-6" />
          <span className="text-xs mt-1">Cari</span>
        </Link>
        <Link href="/order" className="relative -mt-8 bg-gradient-to-br from-blue-500 to-purple-600 p-5 rounded-2xl shadow-lg shadow-blue-500/30">
          <Zap className="w-7 h-7 text-white" />
        </Link>
        <Link href="/orders" className="flex flex-col items-center text-gray-400 hover:text-white transition">
          <Clock className="w-6 h-6" />
          <span className="text-xs mt-1">Pesanan</span>
        </Link>
        <Link href="/profile" className="flex flex-col items-center text-gray-400 hover:text-white transition">
          <Gift className="w-6 h-6" />
          <span className="text-xs mt-1">Promo</span>
        </Link>
      </nav>
    </main>
  )
}
