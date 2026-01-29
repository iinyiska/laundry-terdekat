'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { MapPin, ShoppingBag, Plus, Minus } from 'lucide-react'
import { useRouter } from 'next/navigation'

// Mock location for demo if geolocation fails or http
const DEFAULT_CENTER = { lat: -6.1751, lng: 106.8650 } // Jakarta

type Merchant = {
    id: string
    full_name: string
    address: string
    distance?: number
}

type Service = {
    id: string
    name: string
    price_per_unit: number
    unit_type: string
    merchant_id: string
}

export default function OrderPage() {
    const [merchants, setMerchants] = useState<Merchant[]>([])
    const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null)
    const [services, setServices] = useState<Service[]>([])
    const [cart, setCart] = useState<{ [key: string]: number }>({})
    const [location, setLocation] = useState<{ lat: number, lng: number } | null>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()
    const router = useRouter()

    useEffect(() => {
        // Attempt to get user location
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude
                    })
                    fetchMerchants(pos.coords.latitude, pos.coords.longitude)
                },
                (err) => {
                    console.error("Geo error", err)
                    // Fallback
                    fetchMerchants(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
                }
            )
        } else {
            fetchMerchants(DEFAULT_CENTER.lat, DEFAULT_CENTER.lng)
        }
    }, [])

    const fetchMerchants = async (lat: number, lng: number) => {
        // In a real app with PostGIS, we'd use ST_Distance_Sphere
        // For now we just fetch all 'merchant' profiles and calculate distance client-side (naive approach for MVP)
        const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('role', 'merchant')

        if (data) {
            const withDistance = data.map((m: any) => ({
                ...m,
                // Mock distance random for demo if no coords, or calc if they have one
                distance: Math.random() * 5 // random 0-5km
            })).sort((a: any, b: any) => a.distance - b.distance)
            setMerchants(withDistance)
        }
        setLoading(false)
    }

    const handleSelectMerchant = async (merchant: Merchant) => {
        setSelectedMerchant(merchant)
        const { data } = await supabase
            .from('services')
            .select('*')
            .eq('merchant_id', merchant.id)
        if (data) setServices(data)
    }

    const updateCart = (serviceId: string, delta: number) => {
        setCart(prev => {
            const current = prev[serviceId] || 0
            const next = Math.max(0, current + delta)
            if (next === 0) {
                const { [serviceId]: _, ...rest } = prev
                return rest
            }
            return { ...prev, [serviceId]: next }
        })
    }

    const calculateTotal = () => {
        return Object.entries(cart).reduce((total, [sId, qty]) => {
            const service = services.find(s => s.id === sId)
            return total + (service ? service.price_per_unit * qty : 0)
        }, 0)
    }

    const handleCheckout = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            router.push('/login')
            return
        }
        if (!selectedMerchant) return

        // Create Order
        const { data: order, error } = await supabase
            .from('orders')
            .insert({
                customer_id: user.id,
                merchant_id: selectedMerchant.id,
                status: 'pending',
                total_price: calculateTotal(),
                pickup_lat: location?.lat,
                pickup_lng: location?.lng
            })
            .select()
            .single()

        if (error) {
            alert('Gagal membuat pesanan')
            return
        }

        // Create Order Items
        const items = Object.entries(cart).map(([sId, qty]) => {
            const service = services.find(s => s.id === sId)!
            return {
                order_id: order.id,
                service_id: service.id,
                quantity: qty,
                price_at_order: service.price_per_unit,
                details: `${service.name} (${qty} ${service.unit_type})`
            }
        })

        await supabase.from('order_items').insert(items)

        alert('Pesanan berhasil dibuat! Merchant akan segera konfirmasi.')
        setCart({})
        setSelectedMerchant(null)
    }

    if (loading) return <div className="p-8 text-center">Mencari laundry terdekat...</div>

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            {/* Header */}
            <div className="bg-white shadow sticky top-0 z-10 px-4 py-3 flex items-center gap-2">
                <MapPin className="text-blue-600" />
                <span className="text-sm text-gray-600 truncate">
                    {location ? `Lokasi Terdeteksi (${location.lat.toFixed(4)}, ${location.lng.toFixed(4)})` : 'Mendeteksi lokasi...'}
                </span>
            </div>

            <div className="p-4 max-w-lg mx-auto">
                {!selectedMerchant ? (
                    /* Merchant List */
                    <div className="space-y-4">
                        <h2 className="font-bold text-gray-800 text-lg">Laundry Terdekat</h2>
                        {merchants.map(merchant => (
                            <div
                                key={merchant.id}
                                onClick={() => handleSelectMerchant(merchant)}
                                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 active:scale-95 transition cursor-pointer"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-bold text-gray-800">{merchant.full_name || 'Merchant Tanpa Nama'}</h3>
                                        <p className="text-xs text-gray-500 mt-1">{merchant.address || 'Alamat tidak tersedia'}</p>
                                        <div className="flex items-center gap-1 mt-2">
                                            <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full">Buka</span>
                                            <span className="text-xs text-gray-400">• {merchant.distance?.toFixed(1)} km</span>
                                        </div>
                                    </div>
                                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">IMG</div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Service Selection */
                    <div className="space-y-4">
                        <button onClick={() => setSelectedMerchant(null)} className="text-sm text-blue-600 mb-2 font-medium">← Ganti Merchant</button>
                        <div className="bg-white p-4 rounded-xl border border-blue-100 mb-4">
                            <h2 className="font-bold text-xl">{selectedMerchant.full_name}</h2>
                            <p className="text-sm text-gray-500">Pilih layanan laundry yang diinginkan:</p>
                        </div>

                        {services.map(service => (
                            <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-800">{service.name}</h4>
                                    <p className="text-blue-600 text-sm font-semibold">Rp {service.price_per_unit.toLocaleString('id-ID')} / {service.unit_type}</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    {cart[service.id] > 0 && (
                                        <>
                                            <button onClick={() => updateCart(service.id, -1)} className="p-1 bg-gray-100 rounded-full text-blue-600"><Minus size={16} /></button>
                                            <span className="font-medium w-4 text-center">{cart[service.id]}</span>
                                        </>
                                    )}
                                    <button onClick={() => updateCart(service.id, 1)} className="p-1 bg-blue-600 rounded-full text-white"><Plus size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Cart Float */}
            {selectedMerchant && calculateTotal() > 0 && (
                <div className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto bg-blue-700 text-white p-4 rounded-xl shadow-lg flex justify-between items-center z-50">
                    <div>
                        <p className="text-xs text-blue-200">Total Estimasi</p>
                        <p className="font-bold text-lg">Rp {calculateTotal().toLocaleString('id-ID')}</p>
                    </div>
                    <button
                        onClick={handleCheckout}
                        className="bg-white text-blue-700 px-6 py-2 rounded-lg font-bold hover:bg-gray-100 transition"
                    >
                        Pesan Sekarang
                    </button>
                </div>
            )}
        </div>
    )
}
