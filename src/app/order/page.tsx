'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, ShoppingCart, Plus, Minus, Navigation, ChevronLeft, Star, Clock, Truck, Gift, Check, X, Loader2, Phone, Zap, MessageCircle, FileText } from 'lucide-react'
import Link from 'next/link'

const DEMO_MERCHANTS = [
    { id: 'demo1', street: 'Jl. Sudirman No. 123', area: 'Menteng', city: 'Jakarta Pusat', distance: 0.8, rating: 4.9 },
    { id: 'demo2', street: 'Jl. Gatot Subroto No. 45', area: 'Setiabudi', city: 'Jakarta Selatan', distance: 1.2, rating: 4.7 },
    { id: 'demo3', street: 'Jl. Kuningan Barat No. 67', area: 'Kuningan', city: 'Jakarta Selatan', distance: 2.1, rating: 4.8 },
]

// Item categories for kiloan detail tracking
const ITEM_CATEGORIES = [
    { id: 'shirt', name: 'Kemeja/Baju', icon: '👕' },
    { id: 'pants', name: 'Celana', icon: '👖' },
    { id: 'tshirt', name: 'Kaos', icon: '🎽' },
    { id: 'underwear', name: 'Pakaian Dalam', icon: '🩲' },
    { id: 'socks', name: 'Kaos Kaki (pasang)', icon: '🧦' },
    { id: 'jacket', name: 'Jaket/Sweater', icon: '🧥' },
    { id: 'other', name: 'Lainnya', icon: '📦' },
]

const DEFAULT_SERVICES = [
    { id: 'shirt', name: 'Kemeja/Baju', icon: '👕', price: 5000, unit: 'pcs' },
    { id: 'pants', name: 'Celana', icon: '👖', price: 5000, unit: 'pcs' },
    { id: 'tshirt', name: 'Kaos', icon: '🎽', price: 4000, unit: 'pcs' },
    { id: 'underwear', name: 'Pakaian Dalam', icon: '🩲', price: 3000, unit: 'pcs' },
    { id: 'socks', name: 'Kaos Kaki (pair)', icon: '🧦', price: 2000, unit: 'pcs' },
    { id: 'jacket', name: 'Jaket/Sweater', icon: '🧥', price: 15000, unit: 'pcs' },
    { id: 'dress', name: 'Dress/Gaun', icon: '👗', price: 20000, unit: 'pcs' },
    { id: 'bedsheet', name: 'Sprei', icon: '🛏️', price: 25000, unit: 'pcs' },
    { id: 'blanket', name: 'Selimut', icon: '🛋️', price: 30000, unit: 'pcs' },
    { id: 'towel', name: 'Handuk', icon: '🏊', price: 8000, unit: 'pcs' },
]

type SiteSettings = {
    dashboard_title: string
    dashboard_merchant_prefix: string
    regular_label: string
    regular_price_per_kg: number
    regular_eta: string
    express_label: string
    express_price_per_kg: number
    express_eta: string
    express_enabled: boolean
}

const DEFAULT_SETTINGS: SiteSettings = {
    dashboard_title: 'Pilih Outlet Terdekat',
    dashboard_merchant_prefix: 'Laundry Terdekat',
    regular_label: 'Reguler (24 Jam)',
    regular_price_per_kg: 7000,
    regular_eta: '24 jam',
    express_label: 'Express (8 Jam)',
    express_price_per_kg: 15000,
    express_eta: '8 jam',
    express_enabled: true
}

type Location = { city: string; kelurahan: string; street: string; building: string }
type Merchant = { id: string; street: string; area: string; city: string; distance?: number; rating?: number }
type CartItem = { itemId: string; quantity: number; notes: string }
type ServiceItem = { id: string; name: string; icon: string; price: number; unit: string }
type KiloanItem = { id: string; count: number }

export default function OrderPage() {
    const [location, setLocation] = useState<Location | null>(null)
    const [isLocating, setIsLocating] = useState(true)
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES)
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [kiloanItems, setKiloanItems] = useState<KiloanItem[]>([])
    const [step, setStep] = useState<'merchant' | 'items' | 'confirm'>('merchant')
    const [serviceType, setServiceType] = useState<'kg' | 'piece'>('piece')
    const [deliveryType, setDeliveryType] = useState<'regular' | 'express'>('regular')
    const [kgWeight, setKgWeight] = useState<number>(1)
    const [showDiscount, setShowDiscount] = useState(true)
    const [whatsappNumber, setWhatsappNumber] = useState('')
    const [pickupAddress, setPickupAddress] = useState('')
    const [pickupNotes, setPickupNotes] = useState('')
    const [orderSuccess, setOrderSuccess] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        loadSettings()
        loadServices()
        getLocation()
    }, [])

    const loadSettings = async () => {
        const { data } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
        if (data) setSettings({ ...DEFAULT_SETTINGS, ...data })
    }

    const loadServices = async () => {
        const { data } = await supabase.from('platform_services').select('*').eq('is_active', true).order('sort_order')
        if (data && data.length > 0) {
            setServices(data.map((s: any) => ({ id: s.id, name: s.name, icon: s.icon, price: s.price, unit: s.unit_type })))
        }
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
                        setLocation({
                            city: addr.city || addr.town || 'Jakarta',
                            kelurahan: addr.suburb || addr.village || 'Kelurahan',
                            street: addr.road || 'Jalan',
                            building: addr.house_number || ''
                        })
                    } catch {
                        setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng', street: 'Jl. Sudirman', building: '' })
                    }
                    setIsLocating(false)
                    setMerchants(DEMO_MERCHANTS)
                },
                () => {
                    setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng', street: 'Jl. Sudirman', building: '' })
                    setIsLocating(false)
                    setMerchants(DEMO_MERCHANTS)
                }
            )
        }
    }

    const getMerchantName = (m: Merchant) => `${settings.dashboard_merchant_prefix} ${m.street}`

    const updateCart = (itemId: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(c => c.itemId === itemId)
            if (existing) {
                const newQty = existing.quantity + delta
                if (newQty <= 0) return prev.filter(c => c.itemId !== itemId)
                return prev.map(c => c.itemId === itemId ? { ...c, quantity: newQty } : c)
            } else if (delta > 0) {
                return [...prev, { itemId, quantity: 1, notes: '' }]
            }
            return prev
        })
    }

    const updateKiloanItem = (id: string, delta: number) => {
        setKiloanItems(prev => {
            const existing = prev.find(k => k.id === id)
            if (existing) {
                const newCount = existing.count + delta
                if (newCount <= 0) return prev.filter(k => k.id !== id)
                return prev.map(k => k.id === id ? { ...k, count: newCount } : k)
            } else if (delta > 0) {
                return [...prev, { id, count: 1 }]
            }
            return prev
        })
    }

    const getKgPrice = () => deliveryType === 'express' ? settings.express_price_per_kg : settings.regular_price_per_kg

    const calculateTotal = () => {
        if (serviceType === 'kg') {
            return kgWeight * getKgPrice()
        }
        let total = cart.reduce((sum, item) => {
            const service = services.find(s => s.id === item.itemId)
            return sum + (service ? service.price * item.quantity : 0)
        }, 0)
        // Express satuan = 2x harga
        if (deliveryType === 'express') {
            total = total * 2
        }
        return total
    }

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)
    const getTotalKiloanPieces = () => kiloanItems.reduce((sum, k) => sum + k.count, 0)

    const handleConfirmOrder = () => {
        if (!whatsappNumber) {
            alert('Mohon masukkan nomor WhatsApp')
            return
        }
        setOrderSuccess(true)
    }

    const resetOrder = () => {
        setOrderSuccess(false)
        setCart([])
        setKiloanItems([])
        setSelectedMerchant(null)
        setStep('merchant')
        setKgWeight(1)
        setWhatsappNumber('')
        setPickupAddress('')
        setPickupNotes('')
        setDeliveryType('regular')
    }

    // Success Screen
    if (orderSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center floating">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Pesanan Berhasil! 🎉</h2>
                    <p className="text-gray-400 mb-6">Kurir akan menghubungi {whatsappNumber} via WhatsApp</p>
                    <div className="glass p-4 mb-4 text-left">
                        <p className="text-sm text-gray-400">Outlet:</p>
                        <p className="font-semibold text-white">{selectedMerchant && getMerchantName(selectedMerchant)}</p>
                    </div>
                    <div className="glass p-4 mb-6 text-left">
                        <p className="text-sm text-gray-400">Estimasi:</p>
                        <p className="font-semibold text-white flex items-center gap-2">
                            {deliveryType === 'express' && <Zap className="w-4 h-4 text-yellow-400" />}
                            {deliveryType === 'express' ? settings.express_eta : settings.regular_eta}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={resetOrder} className="flex-1 glass py-3 rounded-xl font-medium hover:bg-white/10 transition">Order Lagi</button>
                        <Link href="/" className="flex-1 btn-gradient py-3 rounded-xl font-semibold text-center">Kembali</Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-32">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2 flex-1 mx-3 overflow-hidden">
                        <div className="w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center flex-shrink-0">
                            <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="min-w-0">
                            {isLocating ? (
                                <span className="flex items-center gap-2 text-sm"><Loader2 className="w-3 h-3 animate-spin" /> Mencari...</span>
                            ) : (
                                <>
                                    <p className="text-sm font-medium truncate">{location?.street} {location?.building}</p>
                                    <p className="text-xs text-gray-400 truncate">{location?.kelurahan}, {location?.city}</p>
                                </>
                            )}
                        </div>
                    </div>
                    <button onClick={getLocation} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition flex-shrink-0">
                        <Navigation className="w-5 h-5 text-blue-400" />
                    </button>
                </div>
            </header>

            {/* Discount Banner */}
            {showDiscount && (
                <div className="mx-4 mt-4 max-w-lg mx-auto">
                    <div className="relative bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 rounded-2xl p-4 flex items-center gap-3">
                        <Gift className="w-10 h-10 text-yellow-400 flex-shrink-0" />
                        <div className="flex-1">
                            <p className="font-bold text-yellow-200">Diskon 20% untuk Member!</p>
                            <p className="text-sm text-yellow-300/70">Daftar dan hemat lebih banyak</p>
                        </div>
                        <button onClick={() => setShowDiscount(false)} className="p-1 text-yellow-400/50 hover:text-yellow-400"><X className="w-5 h-5" /></button>
                    </div>
                </div>
            )}

            <div className="px-4 py-6 max-w-lg mx-auto">
                {/* Step: Merchant */}
                {step === 'merchant' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold gradient-text">{settings.dashboard_title}</h2>
                        <p className="text-gray-400 text-sm">Semua outlet mitra resmi dengan kualitas terjamin</p>
                        <div className="space-y-4 mt-6">
                            {merchants.map(merchant => (
                                <div key={merchant.id} onClick={() => { setSelectedMerchant(merchant); setStep('items') }} className="glass p-5 card-hover cursor-pointer">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <h3 className="font-bold text-lg text-white mb-1">{getMerchantName(merchant)}</h3>
                                            <div className="flex items-center gap-1 mb-2">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold text-yellow-300">{merchant.rating}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">📍 {merchant.area}, {merchant.city}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="text-green-400"><MapPin className="w-3 h-3 inline" /> {merchant.distance?.toFixed(1)} km</span>
                                                <span className="text-blue-400"><Truck className="w-3 h-3 inline" /> Gratis</span>
                                                {settings.express_enabled && <span className="text-yellow-400"><Zap className="w-3 h-3 inline" /> Express</span>}
                                            </div>
                                        </div>
                                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-2xl">🧺</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Items */}
                {step === 'items' && selectedMerchant && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold gradient-text">Detail Cucian</h2>
                                <p className="text-gray-400 text-sm mt-1">{getMerchantName(selectedMerchant)}</p>
                            </div>
                            <button onClick={() => setStep('merchant')} className="text-sm text-blue-400 font-medium">Ganti</button>
                        </div>

                        {/* Service Type */}
                        <div className="glass p-2 flex gap-2">
                            <button onClick={() => setServiceType('piece')} className={`flex-1 py-3 rounded-xl font-medium transition ${serviceType === 'piece' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-400'}`}>Per Satuan</button>
                            <button onClick={() => setServiceType('kg')} className={`flex-1 py-3 rounded-xl font-medium transition ${serviceType === 'kg' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-400'}`}>Per Kilogram</button>
                        </div>

                        {/* Delivery Type */}
                        <div className="glass p-4">
                            <p className="text-sm text-gray-400 mb-3">Kecepatan Layanan</p>
                            <div className="grid grid-cols-2 gap-3">
                                <button onClick={() => setDeliveryType('regular')} className={`p-4 rounded-xl border-2 text-left transition ${deliveryType === 'regular' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10 bg-white/5'}`}>
                                    <p className="font-semibold text-white">{settings.regular_label}</p>
                                    <p className="text-sm text-gray-400">Rp {settings.regular_price_per_kg.toLocaleString()}/kg</p>
                                    {serviceType === 'piece' && <p className="text-xs text-gray-500 mt-1">Satuan: Harga normal</p>}
                                </button>
                                {settings.express_enabled && (
                                    <button onClick={() => setDeliveryType('express')} className={`p-4 rounded-xl border-2 text-left transition ${deliveryType === 'express' ? 'border-yellow-500 bg-yellow-500/20' : 'border-white/10 bg-white/5'}`}>
                                        <p className="font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> {settings.express_label}</p>
                                        <p className="text-sm text-gray-400">Rp {settings.express_price_per_kg.toLocaleString()}/kg</p>
                                        {serviceType === 'piece' && <p className="text-xs text-yellow-500 mt-1">Satuan: 2x lipat</p>}
                                    </button>
                                )}
                            </div>
                        </div>

                        {serviceType === 'kg' ? (
                            <>
                                {/* Kiloan Weight */}
                                <div className="glass p-6">
                                    <h3 className="font-semibold text-white mb-4">Perkiraan Berat</h3>
                                    <div className="flex items-center justify-center gap-6">
                                        <button onClick={() => setKgWeight(Math.max(1, kgWeight - 1))} className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"><Minus className="w-6 h-6" /></button>
                                        <div className="text-center">
                                            <span className="text-5xl font-bold gradient-text">{kgWeight}</span>
                                            <span className="text-2xl text-gray-400 ml-2">kg</span>
                                        </div>
                                        <button onClick={() => setKgWeight(kgWeight + 1)} className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Plus className="w-6 h-6" /></button>
                                    </div>
                                    <p className="text-center text-gray-400 text-sm mt-4">Rp {getKgPrice().toLocaleString()}/kg • {deliveryType === 'express' ? settings.express_eta : settings.regular_eta}</p>
                                </div>

                                {/* Kiloan Item Details */}
                                <div className="glass p-5">
                                    <h3 className="font-semibold text-white flex items-center gap-2 mb-4">
                                        <FileText className="w-5 h-5 text-blue-400" />
                                        Detail Item (untuk tracking)
                                    </h3>
                                    <p className="text-xs text-gray-500 mb-4">Hitung jumlah pakaian biar tidak tertukar</p>
                                    <div className="space-y-3">
                                        {ITEM_CATEGORIES.map(cat => {
                                            const item = kiloanItems.find(k => k.id === cat.id)
                                            const count = item?.count || 0
                                            return (
                                                <div key={cat.id} className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-2xl">{cat.icon}</span>
                                                        <span className="text-white">{cat.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3">
                                                        {count > 0 && (
                                                            <>
                                                                <button onClick={() => updateKiloanItem(cat.id, -1)} className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                                <span className="w-6 text-center font-semibold">{count}</span>
                                                            </>
                                                        )}
                                                        <button onClick={() => updateKiloanItem(cat.id, 1)} className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center text-blue-400"><Plus className="w-4 h-4" /></button>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                    {getTotalKiloanPieces() > 0 && (
                                        <p className="text-sm text-green-400 mt-4 text-center">Total: {getTotalKiloanPieces()} item</p>
                                    )}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-3">
                                {services.map(item => {
                                    const cartItem = cart.find(c => c.itemId === item.id)
                                    const qty = cartItem?.quantity || 0
                                    const displayPrice = deliveryType === 'express' ? item.price * 2 : item.price
                                    return (
                                        <div key={item.id} className="glass p-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">{item.name}</h4>
                                                    <p className="text-sm text-blue-400">
                                                        Rp {displayPrice.toLocaleString()} / {item.unit}
                                                        {deliveryType === 'express' && <span className="text-yellow-400 ml-1">(2x)</span>}
                                                    </p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {qty > 0 && (
                                                        <>
                                                            <button onClick={() => updateCart(item.id, -1)} className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"><Minus className="w-4 h-4" /></button>
                                                            <span className="w-6 text-center font-semibold">{qty}</span>
                                                        </>
                                                    )}
                                                    <button onClick={() => updateCart(item.id, 1)} className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"><Plus className="w-4 h-4" /></button>
                                                </div>
                                            </div>
                                            {qty > 0 && (
                                                <input type="text" placeholder="Catatan: warna, kondisi (opsional)" className="input-glass w-full mt-3 text-sm" value={cartItem?.notes || ''} onChange={(e) => setCart(prev => prev.map(c => c.itemId === item.id ? { ...c, notes: e.target.value } : c))} />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* WhatsApp */}
                        <div className="glass p-5">
                            <h3 className="font-semibold text-white flex items-center gap-2 mb-3">
                                <MessageCircle className="w-5 h-5 text-green-400" />
                                Nomor WhatsApp *
                            </h3>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                <input type="tel" placeholder="08xxxxxxxxxx" className="input-glass w-full pl-12" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} required />
                            </div>
                        </div>

                        {/* Pickup */}
                        <div className="glass p-5 space-y-4">
                            <h3 className="font-semibold text-white flex items-center gap-2"><Truck className="w-5 h-5 text-green-400" /> Alamat Jemput</h3>
                            <input type="text" placeholder="Alamat lengkap" className="input-glass w-full" value={pickupAddress} onChange={(e) => setPickupAddress(e.target.value)} />
                            <textarea placeholder="Notes untuk kurir (opsional)" className="input-glass w-full" rows={2} value={pickupNotes} onChange={(e) => setPickupNotes(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold gradient-text">Konfirmasi Pesanan</h2>

                        <div className="glass p-5">
                            <p className="text-sm text-gray-400 mb-2">Outlet:</p>
                            <p className="font-semibold text-white mb-4">{selectedMerchant && getMerchantName(selectedMerchant)}</p>

                            <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-white/5">
                                {deliveryType === 'express' && <Zap className="w-5 h-5 text-yellow-400" />}
                                <span className={deliveryType === 'express' ? 'text-yellow-300' : 'text-blue-300'}>
                                    {deliveryType === 'express' ? settings.express_label : settings.regular_label}
                                </span>
                            </div>

                            <h3 className="font-semibold mb-3 text-gray-300">Rincian:</h3>
                            {serviceType === 'kg' ? (
                                <>
                                    <div className="flex justify-between py-2 border-b border-white/10">
                                        <span>Cuci Kiloan ({kgWeight} kg)</span>
                                        <span className="font-semibold">Rp {(kgWeight * getKgPrice()).toLocaleString()}</span>
                                    </div>
                                    {getTotalKiloanPieces() > 0 && (
                                        <div className="py-2 border-b border-white/10">
                                            <p className="text-sm text-gray-400 mb-2">Detail item ({getTotalKiloanPieces()} pcs):</p>
                                            <div className="flex flex-wrap gap-2">
                                                {kiloanItems.filter(k => k.count > 0).map(k => {
                                                    const cat = ITEM_CATEGORIES.find(c => c.id === k.id)
                                                    return <span key={k.id} className="text-xs bg-white/10 px-2 py-1 rounded">{cat?.icon} {cat?.name}: {k.count}</span>
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                cart.map(item => {
                                    const service = services.find(s => s.id === item.itemId)
                                    if (!service) return null
                                    const price = deliveryType === 'express' ? service.price * 2 : service.price
                                    return (
                                        <div key={item.itemId} className="py-2 border-b border-white/10">
                                            <div className="flex justify-between">
                                                <span>{service.icon} {service.name} x{item.quantity}</span>
                                                <span className="font-medium">Rp {(price * item.quantity).toLocaleString()}</span>
                                            </div>
                                            {item.notes && <p className="text-xs text-gray-400 mt-1">📝 {item.notes}</p>}
                                        </div>
                                    )
                                })
                            )}
                            {deliveryType === 'express' && serviceType === 'piece' && (
                                <div className="flex justify-between py-2 text-yellow-400 text-sm"><span>⚡ Harga Express (2x lipat)</span><span>Included</span></div>
                            )}
                            <div className="flex justify-between pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span className="gradient-text">Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="glass p-4"><p className="text-sm text-gray-400">WhatsApp:</p><p className="text-white font-medium">{whatsappNumber}</p></div>
                        {pickupAddress && <div className="glass p-4"><p className="text-sm text-gray-400">Alamat:</p><p className="text-white">{pickupAddress}</p>{pickupNotes && <p className="text-sm text-gray-500 mt-1">Notes: {pickupNotes}</p>}</div>}

                        <button onClick={handleConfirmOrder} className="btn-gradient w-full text-lg py-4"><Check className="w-5 h-5 inline mr-2" />Konfirmasi Pesanan</button>
                    </div>
                )}
            </div>

            {/* Floating Cart */}
            {step === 'items' && (calculateTotal() > 0 || serviceType === 'kg') && (
                <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto">
                    <div className="glass-bright p-4 flex items-center justify-between rounded-2xl shadow-2xl">
                        <div>
                            <p className="text-xs text-gray-400">
                                {serviceType === 'kg' ? `${kgWeight} kg • ${getTotalKiloanPieces()} item` : `${getTotalItems()} item`}
                                {deliveryType === 'express' && ' • Express'}
                            </p>
                            <p className="text-xl font-bold gradient-text">Rp {calculateTotal().toLocaleString()}</p>
                        </div>
                        <button onClick={() => setStep('confirm')} disabled={!whatsappNumber} className={`flex items-center gap-2 font-semibold py-3 px-6 rounded-xl transition ${whatsappNumber ? 'btn-gradient' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}>
                            <ShoppingCart className="w-5 h-5" />Lanjutkan
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
