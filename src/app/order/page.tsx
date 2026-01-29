'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, ShoppingCart, Plus, Minus, Navigation, ChevronLeft, Star, Clock, Truck, Gift, Check, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

// Default merchants (Laundry Terdekat branding)
const DEMO_MERCHANTS = [
    { id: 'demo1', name: 'Laundry Terdekat Jl. Sudirman No. 123', area: 'Menteng, Jakarta Pusat', distance: 0.8, rating: 4.9 },
    { id: 'demo2', name: 'Laundry Terdekat Jl. Gatot Subroto No. 45', area: 'Setiabudi, Jakarta Selatan', distance: 1.2, rating: 4.7 },
    { id: 'demo3', name: 'Laundry Terdekat Jl. Kuningan Barat No. 67', area: 'Kuningan, Jakarta Selatan', distance: 2.1, rating: 4.8 },
    { id: 'demo4', name: 'Laundry Terdekat Jl. Thamrin No. 88', area: 'Gondangdia, Jakarta Pusat', distance: 2.5, rating: 4.6 },
]

// Default Laundry item types
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

type Merchant = {
    id: string
    name: string
    area: string
    distance?: number
    rating?: number
}

type ServiceItem = {
    id: string
    name: string
    icon: string
    price: number
    unit: string
}

type CartItem = {
    itemId: string
    quantity: number
    notes: string
}

export default function OrderPage() {
    const [location, setLocation] = useState<{ city: string; kelurahan: string } | null>(null)
    const [isLocating, setIsLocating] = useState(true)
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [services, setServices] = useState<ServiceItem[]>(DEFAULT_SERVICES)
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [step, setStep] = useState<'merchant' | 'items' | 'confirm'>('merchant')
    const [serviceType, setServiceType] = useState<'kg' | 'piece'>('piece')
    const [kgWeight, setKgWeight] = useState<number>(1)
    const [showDiscount, setShowDiscount] = useState(true)
    const [pickupAddress, setPickupAddress] = useState('')
    const [pickupNotes, setPickupNotes] = useState('')
    const [orderSuccess, setOrderSuccess] = useState(false)
    const supabase = createClient()

    useEffect(() => {
        getLocation()
        loadServices()
    }, [])

    const getLocation = () => {
        setIsLocating(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords
                    // Reverse geocode to city/kelurahan
                    try {
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
                        )
                        const data = await response.json()
                        const address = data.address || {}
                        setLocation({
                            city: address.city || address.town || address.municipality || 'Jakarta',
                            kelurahan: address.suburb || address.village || address.neighbourhood || 'Kelurahan'
                        })
                    } catch {
                        setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng' })
                    }
                    setIsLocating(false)
                    setMerchants(DEMO_MERCHANTS)
                },
                () => {
                    setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng' })
                    setIsLocating(false)
                    setMerchants(DEMO_MERCHANTS)
                }
            )
        } else {
            setLocation({ city: 'Jakarta Pusat', kelurahan: 'Menteng' })
            setIsLocating(false)
            setMerchants(DEMO_MERCHANTS)
        }
    }

    const loadServices = async () => {
        const { data } = await supabase
            .from('platform_services')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true })

        if (data && data.length > 0) {
            setServices(data.map((s: any) => ({
                id: s.id,
                name: s.name,
                icon: s.icon,
                price: s.price,
                unit: s.unit_type
            })))
        }
    }

    const updateCart = (itemId: string, delta: number) => {
        setCart(prev => {
            const existing = prev.find(c => c.itemId === itemId)
            if (existing) {
                const newQty = existing.quantity + delta
                if (newQty <= 0) {
                    return prev.filter(c => c.itemId !== itemId)
                }
                return prev.map(c => c.itemId === itemId ? { ...c, quantity: newQty } : c)
            } else if (delta > 0) {
                return [...prev, { itemId, quantity: 1, notes: '' }]
            }
            return prev
        })
    }

    const updateItemNotes = (itemId: string, notes: string) => {
        setCart(prev => prev.map(c => c.itemId === itemId ? { ...c, notes } : c))
    }

    const calculateTotal = () => {
        if (serviceType === 'kg') {
            return kgWeight * 7000
        }
        return cart.reduce((total, item) => {
            const service = services.find(s => s.id === item.itemId)
            return total + (service ? service.price * item.quantity : 0)
        }, 0)
    }

    const getTotalItems = () => cart.reduce((sum, item) => sum + item.quantity, 0)

    const handleConfirmOrder = async () => {
        setOrderSuccess(true)
    }

    const resetOrder = () => {
        setOrderSuccess(false)
        setCart([])
        setSelectedMerchant(null)
        setStep('merchant')
        setKgWeight(1)
        setPickupAddress('')
        setPickupNotes('')
    }

    // Order Success Screen
    if (orderSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4">
                <div className="fixed inset-0 -z-10 overflow-hidden">
                    <div className="absolute top-1/4 -left-32 w-96 h-96 bg-green-500/20 rounded-full blur-[120px]"></div>
                    <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-[120px]"></div>
                </div>
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center floating">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Pesanan Berhasil! 🎉</h2>
                    <p className="text-gray-400 mb-6">
                        Kurir kami akan segera menghubungi Anda untuk menjemput cucian.
                    </p>
                    <div className="glass p-4 mb-6 text-left">
                        <p className="text-sm text-gray-400">Outlet:</p>
                        <p className="font-semibold text-white">{selectedMerchant?.name}</p>
                        <p className="text-sm text-gray-500 mt-2">Area: {selectedMerchant?.area}</p>
                    </div>
                    <div className="flex gap-3">
                        <button onClick={resetOrder} className="flex-1 glass py-3 rounded-xl font-medium hover:bg-white/10 transition">
                            Order Lagi
                        </button>
                        <Link href="/" className="flex-1 btn-gradient py-3 rounded-xl font-semibold text-center">
                            Kembali
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-32">
            {/* Ambient Background */}
            <div className="fixed inset-0 -z-10 overflow-hidden">
                <div className="absolute top-1/4 -left-32 w-96 h-96 bg-blue-500/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]"></div>
            </div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-lg mx-auto flex items-center justify-between">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-full bg-blue-500/30 flex items-center justify-center">
                            <MapPin className="w-4 h-4 text-blue-400" />
                        </div>
                        <span className="text-sm font-medium truncate max-w-[200px]">
                            {isLocating ? (
                                <span className="flex items-center gap-2">
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                    Mencari...
                                </span>
                            ) : (
                                `${location?.kelurahan}, ${location?.city}`
                            )}
                        </span>
                    </div>
                    <button onClick={getLocation} className="p-2 rounded-xl bg-white/10 hover:bg-white/20 transition">
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
                            <p className="text-sm text-yellow-300/70">Daftar sekarang dan hemat lebih banyak</p>
                        </div>
                        <button onClick={() => setShowDiscount(false)} className="p-1 text-yellow-400/50 hover:text-yellow-400">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            )}

            <div className="px-4 py-6 max-w-lg mx-auto">
                {/* Step: Select Merchant */}
                {step === 'merchant' && (
                    <div className="space-y-4">
                        <h2 className="text-2xl font-bold gradient-text">Pilih Outlet Terdekat</h2>
                        <p className="text-gray-400 text-sm">
                            Semua outlet adalah mitra resmi Laundry Terdekat dengan kualitas terjamin
                        </p>

                        <div className="space-y-4 mt-6">
                            {merchants.map(merchant => (
                                <div
                                    key={merchant.id}
                                    onClick={() => {
                                        setSelectedMerchant(merchant)
                                        setStep('items')
                                    }}
                                    className="glass p-5 card-hover cursor-pointer"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg text-white">{merchant.name}</h3>
                                            </div>
                                            <div className="flex items-center gap-1 mb-2">
                                                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                                <span className="text-sm font-semibold text-yellow-300">{merchant.rating}</span>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">📍 {merchant.area}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {merchant.distance?.toFixed(1)} km
                                                </span>
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <Truck className="w-3 h-3" />
                                                    Antar Jemput Gratis
                                                </span>
                                                <span className="flex items-center gap-1 text-purple-400">
                                                    <Clock className="w-3 h-3" />
                                                    Est. 24 Jam
                                                </span>
                                            </div>
                                        </div>
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/30 to-purple-500/30 flex items-center justify-center text-3xl">
                                            🧺
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Step: Select Items */}
                {step === 'items' && selectedMerchant && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-2xl font-bold gradient-text">Detail Cucian</h2>
                                <p className="text-gray-400 text-sm mt-1">{selectedMerchant.name}</p>
                            </div>
                            <button
                                onClick={() => setStep('merchant')}
                                className="text-sm text-blue-400 font-medium"
                            >
                                Ganti
                            </button>
                        </div>

                        {/* Service Type Toggle */}
                        <div className="glass p-2 flex gap-2">
                            <button
                                onClick={() => setServiceType('piece')}
                                className={`flex-1 py-3 rounded-xl font-medium transition ${serviceType === 'piece' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-400'}`}
                            >
                                Per Satuan
                            </button>
                            <button
                                onClick={() => setServiceType('kg')}
                                className={`flex-1 py-3 rounded-xl font-medium transition ${serviceType === 'kg' ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'text-gray-400'}`}
                            >
                                Per Kilogram
                            </button>
                        </div>

                        {serviceType === 'kg' ? (
                            <div className="glass p-6">
                                <h3 className="font-semibold text-white mb-4">Perkiraan Berat</h3>
                                <div className="flex items-center justify-center gap-6">
                                    <button
                                        onClick={() => setKgWeight(Math.max(1, kgWeight - 1))}
                                        className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                                    >
                                        <Minus className="w-6 h-6" />
                                    </button>
                                    <div className="text-center">
                                        <span className="text-5xl font-bold gradient-text">{kgWeight}</span>
                                        <span className="text-2xl text-gray-400 ml-2">kg</span>
                                    </div>
                                    <button
                                        onClick={() => setKgWeight(kgWeight + 1)}
                                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center hover:opacity-90 transition"
                                    >
                                        <Plus className="w-6 h-6" />
                                    </button>
                                </div>
                                <p className="text-center text-gray-400 text-sm mt-4">
                                    Harga: Rp 7.000/kg (termasuk cuci + setrika)
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {services.map(item => {
                                    const cartItem = cart.find(c => c.itemId === item.id)
                                    const qty = cartItem?.quantity || 0
                                    return (
                                        <div key={item.id} className="glass p-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">{item.name}</h4>
                                                    <p className="text-sm text-blue-400">Rp {item.price.toLocaleString('id-ID')} / {item.unit}</p>
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    {qty > 0 && (
                                                        <>
                                                            <button
                                                                onClick={() => updateCart(item.id, -1)}
                                                                className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center"
                                                            >
                                                                <Minus className="w-4 h-4" />
                                                            </button>
                                                            <span className="w-6 text-center font-semibold">{qty}</span>
                                                        </>
                                                    )}
                                                    <button
                                                        onClick={() => updateCart(item.id, 1)}
                                                        className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                            {qty > 0 && (
                                                <input
                                                    type="text"
                                                    placeholder="Catatan: warna, kondisi, dll (opsional)"
                                                    className="input-glass w-full mt-3 text-sm"
                                                    value={cartItem?.notes || ''}
                                                    onChange={(e) => updateItemNotes(item.id, e.target.value)}
                                                />
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}

                        {/* Pickup Address */}
                        <div className="glass p-5 space-y-4">
                            <h3 className="font-semibold text-white flex items-center gap-2">
                                <Truck className="w-5 h-5 text-green-400" />
                                Alamat Jemput
                            </h3>
                            <input
                                type="text"
                                placeholder="Alamat lengkap untuk penjemputan"
                                className="input-glass w-full"
                                value={pickupAddress}
                                onChange={(e) => setPickupAddress(e.target.value)}
                            />
                            <textarea
                                placeholder="Catatan untuk kurir (opsional)"
                                className="input-glass w-full"
                                rows={2}
                                value={pickupNotes}
                                onChange={(e) => setPickupNotes(e.target.value)}
                            />
                        </div>
                    </div>
                )}

                {/* Step: Confirm */}
                {step === 'confirm' && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-bold gradient-text">Konfirmasi Pesanan</h2>

                        <div className="glass p-5">
                            <p className="text-sm text-gray-400 mb-2">Outlet:</p>
                            <p className="font-semibold text-white mb-4">{selectedMerchant?.name}</p>

                            <h3 className="font-semibold mb-3 text-gray-300">Rincian Cucian:</h3>
                            {serviceType === 'kg' ? (
                                <div className="flex justify-between py-2 border-b border-white/10">
                                    <span>Cuci Kiloan ({kgWeight} kg)</span>
                                    <span className="font-semibold">Rp {(kgWeight * 7000).toLocaleString('id-ID')}</span>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const service = services.find(s => s.id === item.itemId)
                                    if (!service) return null
                                    return (
                                        <div key={item.itemId} className="py-2 border-b border-white/10">
                                            <div className="flex justify-between">
                                                <span>{service.icon} {service.name} x{item.quantity}</span>
                                                <span className="font-medium">Rp {(service.price * item.quantity).toLocaleString('id-ID')}</span>
                                            </div>
                                            {item.notes && <p className="text-xs text-gray-400 mt-1">📝 {item.notes}</p>}
                                        </div>
                                    )
                                })
                            )}
                            <div className="flex justify-between pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span className="gradient-text">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                            </div>
                        </div>

                        {pickupAddress && (
                            <div className="glass p-4">
                                <p className="text-sm text-gray-400">Alamat Jemput:</p>
                                <p className="text-white">{pickupAddress}</p>
                                {pickupNotes && <p className="text-sm text-gray-500 mt-1">Catatan: {pickupNotes}</p>}
                            </div>
                        )}

                        <button onClick={handleConfirmOrder} className="btn-gradient w-full text-lg py-4">
                            <Check className="w-5 h-5 inline mr-2" />
                            Konfirmasi & Jemput Sekarang
                        </button>
                    </div>
                )}
            </div>

            {/* Floating Cart */}
            {step === 'items' && (calculateTotal() > 0 || serviceType === 'kg') && (
                <div className="fixed bottom-6 left-4 right-4 max-w-lg mx-auto">
                    <div className="glass-bright p-4 flex items-center justify-between rounded-2xl shadow-2xl">
                        <div>
                            <p className="text-xs text-gray-400">
                                {serviceType === 'kg' ? `${kgWeight} kg` : `${getTotalItems()} item`}
                            </p>
                            <p className="text-xl font-bold gradient-text">
                                Rp {calculateTotal().toLocaleString('id-ID')}
                            </p>
                        </div>
                        <button
                            onClick={() => setStep('confirm')}
                            className="btn-gradient flex items-center gap-2"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Lanjutkan
                        </button>
                    </div>
                </div>
            )}
        </main>
    )
}
