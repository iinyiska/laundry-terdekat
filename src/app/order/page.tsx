'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, ShoppingCart, Plus, Minus, Navigation, Sparkles, ChevronLeft, Shirt, Star, Clock, Truck, Gift, Check, X } from 'lucide-react'
import Link from 'next/link'

// Default location
const DEFAULT_CENTER = { lat: -6.1751, lng: 106.8650, address: 'Jakarta, Indonesia' }

// Laundry item types for detailed input
const LAUNDRY_ITEMS = [
    { id: 'shirt', name: 'Kemeja/Baju', icon: '👕', price: 5000 },
    { id: 'pants', name: 'Celana', icon: '👖', price: 5000 },
    { id: 'tshirt', name: 'Kaos', icon: '🎽', price: 4000 },
    { id: 'underwear', name: 'Pakaian Dalam', icon: '🩲', price: 3000 },
    { id: 'socks', name: 'Kaos Kaki (pair)', icon: '🧦', price: 2000 },
    { id: 'jacket', name: 'Jaket/Sweater', icon: '🧥', price: 15000 },
    { id: 'dress', name: 'Dress/Gaun', icon: '👗', price: 20000 },
    { id: 'bedsheet', name: 'Sprei', icon: '🛏️', price: 25000 },
    { id: 'blanket', name: 'Selimut', icon: '🛋️', price: 30000 },
    { id: 'towel', name: 'Handuk', icon: '🏊', price: 8000 },
]

type Merchant = {
    id: string
    full_name: string
    address: string
    distance?: number
    rating?: number
}

type CartItem = {
    itemId: string
    quantity: number
    notes: string
}

export default function OrderPage() {
    const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null)
    const [isLocating, setIsLocating] = useState(true)
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
    const [cart, setCart] = useState<CartItem[]>([])
    const [step, setStep] = useState<'location' | 'merchant' | 'items' | 'confirm'>('location')
    const [serviceType, setServiceType] = useState<'kg' | 'piece'>('piece')
    const [kgWeight, setKgWeight] = useState<number>(1)
    const [showDiscount, setShowDiscount] = useState(true)
    const [pickupAddress, setPickupAddress] = useState('')
    const [pickupNotes, setPickupNotes] = useState('')
    const supabase = createClient()

    useEffect(() => {
        getLocation()
    }, [])

    const getLocation = () => {
        setIsLocating(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    const { latitude, longitude } = pos.coords
                    setLocation({
                        lat: latitude,
                        lng: longitude,
                        address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
                    })
                    setIsLocating(false)
                    fetchMerchants(latitude, longitude)
                },
                () => {
                    setLocation(DEFAULT_CENTER)
                    setIsLocating(false)
                    fetchMerchants(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
                }
            )
        } else {
            setLocation(DEFAULT_CENTER)
            setIsLocating(false)
            fetchMerchants(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
        }
    }

    const fetchMerchants = async (lat: number, lng: number) => {
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'merchant')

        if (data && data.length > 0) {
            const withDistance = data.map((m: any) => ({
                ...m,
                distance: Math.random() * 3 + 0.5, // Mock distance 0.5-3.5km
                rating: (Math.random() * 1 + 4).toFixed(1) // Mock rating 4.0-5.0
            })).sort((a: any, b: any) => a.distance - b.distance)
            setMerchants(withDistance)
        } else {
            // Demo merchants if no real data
            setMerchants([
                { id: 'demo1', full_name: 'LaundryKu Express', address: 'Jl. Sudirman No. 123', distance: 0.8, rating: 4.9 },
                { id: 'demo2', full_name: 'Bersih Wangi Laundry', address: 'Jl. Gatot Subroto No. 45', distance: 1.2, rating: 4.7 },
                { id: 'demo3', full_name: 'Fresh & Clean', address: 'Jl. Kuningan Barat No. 67', distance: 2.1, rating: 4.8 },
            ])
        }
        setStep('merchant')
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
            return kgWeight * 7000 // Rp 7000/kg
        }
        return cart.reduce((total, item) => {
            const laundryItem = LAUNDRY_ITEMS.find(l => l.id === item.itemId)
            return total + (laundryItem ? laundryItem.price * item.quantity : 0)
        }, 0)
    }

    const getTotalItems = () => {
        return cart.reduce((sum, item) => sum + item.quantity, 0)
    }

    const handleConfirmOrder = async () => {
        alert('🎉 Pesanan berhasil dibuat! Kurir kami akan segera menjemput cucian Anda.')
        setCart([])
        setSelectedMerchant(null)
        setStep('merchant')
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
                            {isLocating ? 'Mencari...' : location?.address}
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
                        <h2 className="text-2xl font-bold gradient-text">Pilih Laundry Terdekat</h2>
                        <p className="text-gray-400 text-sm">Pilih mitra laundry terpercaya di sekitarmu</p>

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
                                                <h3 className="font-bold text-lg text-white">{merchant.full_name}</h3>
                                                <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-0.5 rounded-full">
                                                    <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                                                    <span className="text-xs font-semibold text-yellow-300">{merchant.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-sm text-gray-400 mb-3">{merchant.address}</p>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className="flex items-center gap-1 text-green-400">
                                                    <MapPin className="w-3 h-3" />
                                                    {merchant.distance?.toFixed(1)} km
                                                </span>
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <Truck className="w-3 h-3" />
                                                    Antar Jemput
                                                </span>
                                                <span className="flex items-center gap-1 text-purple-400">
                                                    <Clock className="w-3 h-3" />
                                                    24 Jam
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
                                <p className="text-gray-400 text-sm mt-1">{selectedMerchant.full_name}</p>
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
                            /* Kilogram Mode */
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
                            /* Piece Mode */
                            <div className="space-y-3">
                                {LAUNDRY_ITEMS.map(item => {
                                    const cartItem = cart.find(c => c.itemId === item.id)
                                    const qty = cartItem?.quantity || 0
                                    return (
                                        <div key={item.id} className="glass p-4">
                                            <div className="flex items-center gap-4">
                                                <span className="text-3xl">{item.icon}</span>
                                                <div className="flex-1">
                                                    <h4 className="font-medium text-white">{item.name}</h4>
                                                    <p className="text-sm text-blue-400">Rp {item.price.toLocaleString('id-ID')}</p>
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
                                                    placeholder="Catatan: warna, kondisi (opsional)"
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
                            <h3 className="font-semibold mb-3">Rincian Cucian</h3>
                            {serviceType === 'kg' ? (
                                <div className="flex justify-between">
                                    <span>Cuci Kiloan ({kgWeight} kg)</span>
                                    <span className="font-semibold">Rp {(kgWeight * 7000).toLocaleString('id-ID')}</span>
                                </div>
                            ) : (
                                cart.map(item => {
                                    const laundryItem = LAUNDRY_ITEMS.find(l => l.id === item.itemId)
                                    if (!laundryItem) return null
                                    return (
                                        <div key={item.itemId} className="flex justify-between py-2 border-b border-white/10">
                                            <div>
                                                <span>{laundryItem.icon} {laundryItem.name} x{item.quantity}</span>
                                                {item.notes && <p className="text-xs text-gray-400">📝 {item.notes}</p>}
                                            </div>
                                            <span className="font-medium">Rp {(laundryItem.price * item.quantity).toLocaleString('id-ID')}</span>
                                        </div>
                                    )
                                })
                            )}
                            <div className="flex justify-between pt-4 text-lg font-bold">
                                <span>Total</span>
                                <span className="gradient-text">Rp {calculateTotal().toLocaleString('id-ID')}</span>
                            </div>
                        </div>

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
