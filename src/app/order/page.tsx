'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { MapPin, ChevronLeft, Navigation, Loader2, Zap, Package, Phone, MessageCircle, Clock, Check, AlertCircle, Minus, Plus } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

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
    primary_color: string
    accent_color: string
}

type ServiceItem = {
    id: string
    name: string
    icon: string
    price: number
    unit_type: string
    is_active: boolean
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
    express_enabled: true,
    primary_color: '#3b82f6',
    accent_color: '#8b5cf6'
}

const KILOAN_ITEMS = [
    { key: 'baju', label: 'Baju/Kemeja', icon: '👕' },
    { key: 'celana', label: 'Celana', icon: '👖' },
    { key: 'kaos', label: 'Kaos', icon: '🎽' },
    { key: 'daleman', label: 'Pakaian Dalam', icon: '🩲' },
    { key: 'kaoskaki', label: 'Kaos Kaki', icon: '🧦' },
    { key: 'handuk', label: 'Handuk', icon: '🏊' },
    { key: 'lainnya', label: 'Lainnya', icon: '📦' },
]

export default function OrderPage() {
    const [step, setStep] = useState(1)
    const [orderType, setOrderType] = useState<'satuan' | 'kiloan'>('kiloan')
    const [serviceSpeed, setServiceSpeed] = useState<'regular' | 'express'>('regular')
    const [location, setLocation] = useState<{ address: string; kelurahan: string; city: string; lat: number; lng: number } | null>(null)
    const [isLocating, setIsLocating] = useState(false)
    const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS)
    const [services, setServices] = useState<ServiceItem[]>([])

    // Contact info - now in Step 3
    const [whatsapp, setWhatsapp] = useState('')
    const [customerName, setCustomerName] = useState('')
    const [fullAddress, setFullAddress] = useState('')
    const [notes, setNotes] = useState('')

    // Kiloan items count
    const [kiloanItems, setKiloanItems] = useState<Record<string, number>>({})
    const [weight, setWeight] = useState(3)

    // Satuan items
    const [satuanItems, setSatuanItems] = useState<Record<string, number>>({})

    const [submitting, setSubmitting] = useState(false)
    const [orderSuccess, setOrderSuccess] = useState<string | null>(null)
    const [error, setError] = useState('')

    const supabase = createClient()

    useEffect(() => {
        loadData()
        getLocation()
    }, [])

    const loadData = async () => {
        const { data: s } = await supabase.from('site_settings').select('*').eq('id', 'main').single()
        if (s) setSettings({ ...DEFAULT_SETTINGS, ...s })

        const { data: svc } = await supabase.from('platform_services').select('*').eq('is_active', true).order('sort_order')
        if (svc) setServices(svc)
    }

    const getLocation = () => {
        setIsLocating(true)
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                async (pos) => {
                    try {
                        // Use zoom=18 for street-level detail including house numbers
                        const response = await fetch(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&addressdetails=1&zoom=18&extratags=1`
                        )
                        const data = await response.json()
                        const addr = data.address || {}

                        // Extract address components
                        const houseNumber = addr.house_number || ''
                        const road = addr.road || addr.pedestrian || addr.footway || addr.path || ''
                        const building = addr.building || addr.amenity || addr.shop || addr.office || ''
                        const complex = addr.residential || addr.industrial || ''
                        const neighbourhood = addr.neighbourhood || addr.hamlet || ''
                        const kelurahan = addr.suburb || addr.village || addr.subdistrict || ''
                        const kecamatan = addr.district || addr.city_district || ''
                        const city = addr.city || addr.town || addr.municipality || addr.county || addr.state || ''
                        const postcode = addr.postcode || ''

                        // Build detailed address string
                        const addressParts = []

                        // Primary: Street and number
                        if (road) {
                            let streetAddr = road
                            if (houseNumber) streetAddr += ' No. ' + houseNumber
                            addressParts.push(streetAddr)
                        }

                        // Building/Complex name
                        if (building) addressParts.push(building)
                        if (complex && complex !== building) addressParts.push(complex)

                        // Neighbourhood
                        if (neighbourhood && neighbourhood !== kelurahan) addressParts.push(neighbourhood)

                        // Kelurahan/Desa
                        if (kelurahan) addressParts.push(kelurahan)

                        // Kecamatan
                        if (kecamatan && kecamatan !== kelurahan) addressParts.push(kecamatan)

                        // City
                        if (city) addressParts.push(city)

                        // Postcode
                        if (postcode) addressParts.push(postcode)

                        const fullAddress = addressParts.length > 0
                            ? addressParts.join(', ')
                            : data.display_name

                        setLocation({
                            address: fullAddress,
                            kelurahan: kelurahan || neighbourhood || 'Kelurahan',
                            city: city || 'Yogyakarta',
                            lat: pos.coords.latitude,
                            lng: pos.coords.longitude
                        })
                    } catch {
                        // Fallback to Yogyakarta
                        setLocation({
                            address: 'Jl. Malioboro No. 52, Sosromenduran, Yogyakarta',
                            kelurahan: 'Sosromenduran',
                            city: 'Yogyakarta',
                            lat: -7.7956,
                            lng: 110.3695
                        })
                    }
                    setIsLocating(false)
                },
                () => {
                    // Fallback to Yogyakarta
                    setLocation({
                        address: 'Jl. Malioboro No. 52, Sosromenduran, Yogyakarta',
                        kelurahan: 'Sosromenduran',
                        city: 'Yogyakarta',
                        lat: -7.7956,
                        lng: 110.3695
                    })
                    setIsLocating(false)
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0 // Always get fresh location
                }
            )
        }
    }

    const calculateTotal = () => {
        if (orderType === 'kiloan') {
            const pricePerKg = serviceSpeed === 'express' ? settings.express_price_per_kg : settings.regular_price_per_kg
            return weight * pricePerKg
        } else {
            let total = 0
            services.forEach(s => {
                const qty = satuanItems[s.id] || 0
                const price = serviceSpeed === 'express' ? s.price * 2 : s.price
                total += qty * price
            })
            return total
        }
    }

    const getTotalItems = () => {
        if (orderType === 'kiloan') {
            return Object.values(kiloanItems).reduce((a, b) => a + b, 0)
        }
        return Object.values(satuanItems).reduce((a, b) => a + b, 0)
    }

    const handleSubmit = async () => {
        if (!whatsapp || !customerName) {
            setError('Nama dan WhatsApp wajib diisi')
            return
        }
        if (!location) {
            setError('Lokasi belum terdeteksi')
            return
        }

        setSubmitting(true)
        setError('')

        try {
            // Get current user ID
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Anda harus login kembali')

            // Generate order number
            const orderNum = 'LT' + new Date().toISOString().slice(2, 10).replace(/-/g, '') + '-' + String(Math.floor(Math.random() * 10000)).padStart(4, '0')

            // Prepare items data
            let itemsData = null
            let itemsDetail = null

            if (orderType === 'satuan') {
                itemsData = services
                    .filter(s => satuanItems[s.id] > 0)
                    .map(s => ({
                        name: s.name,
                        qty: satuanItems[s.id],
                        price: serviceSpeed === 'express' ? s.price * 2 : s.price
                    }))
            } else {
                itemsDetail = kiloanItems
            }

            const newOrder = {
                user_id: user.id, // Critical Fix
                order_number: orderNum,
                customer_name: customerName,
                customer_whatsapp: whatsapp,
                pickup_address: fullAddress || location.address,
                pickup_kelurahan: location.kelurahan,
                pickup_city: location.city,
                pickup_latitude: location.lat,
                pickup_longitude: location.lng,
                order_type: orderType,
                service_speed: serviceSpeed,
                weight_kg: orderType === 'kiloan' ? weight : null,
                items_detail: itemsDetail,
                items: itemsData,
                subtotal: calculateTotal(),
                total: calculateTotal(),
                notes: notes,
                status: 'pending'
            }

            // Create order
            const { data: order, error: orderError } = await supabase.from('orders').insert(newOrder).select().single()

            if (orderError) throw orderError

            // Add status history
            await supabase.from('order_status_history').insert({
                order_id: order.id,
                status: 'pending',
                notes: 'Order dibuat'
            })

            // OPTIMISTIC UPDATE CACHE
            // Add new order to top of cache so it appears instantly in list
            try {
                const cachedOrders = localStorage.getItem('laundry_orders_cache')
                let ordersList = cachedOrders ? JSON.parse(cachedOrders) : []
                // Add new order to start
                ordersList = [order, ...ordersList]
                localStorage.setItem('laundry_orders_cache', JSON.stringify(ordersList))
            } catch (e) { console.error('Cache update failed', e) }

            setOrderSuccess(orderNum)
        } catch (err: any) {
            console.error('Order error:', err)
            setError('Gagal membuat pesanan: ' + (err.message || 'Unknown error'))
        }

        setSubmitting(false)
    }

    // Success screen
    if (orderSuccess) {
        return (
            <main className="min-h-screen flex items-center justify-center px-4 pb-nav">
                <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>
                <div className="text-center max-w-md">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center">
                        <Check className="w-12 h-12 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">Pesanan Berhasil! 🎉</h2>
                    <p className="text-gray-400 mb-2">Nomor Order:</p>
                    <p className="text-2xl font-bold text-green-400 mb-6">{orderSuccess}</p>
                    <p className="text-gray-400 mb-6">Kurir akan menghubungi via WhatsApp untuk konfirmasi penjemputan.</p>
                    <div className="flex gap-4 justify-center">
                        <Link href="/" className="btn-gradient px-8 py-3">Kembali</Link>
                        <Link href="/orders" className="glass px-8 py-3 rounded-xl text-white">Lihat Pesanan</Link>
                    </div>
                </div>
            </main>
        )
    }

    return (
        <main className="min-h-screen pb-nav">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20"><ChevronLeft className="w-5 h-5" /></Link>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg text-white">Order</h1>
                        <p className="text-xs text-gray-400">Step {step} of 3</p>
                    </div>
                </div>
            </header>

            <div className="px-4 max-w-2xl mx-auto py-6 space-y-6">

                {/* Step 1: Location + Service Type Selection */}
                {step === 1 && (
                    <>
                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MapPin className="w-5 h-5 text-blue-400" />Lokasi Penjemputan</h3>
                            <div className="flex items-center gap-4">
                                <div className="relative w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center location-pulse flex-shrink-0">
                                    <MapPin className="w-6 h-6 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    {isLocating ? (
                                        <div className="flex items-center gap-2 text-gray-400"><Loader2 className="w-4 h-4 animate-spin" />Mendeteksi lokasi...</div>
                                    ) : location ? (
                                        <>
                                            <p className="font-semibold text-white">{location.address}</p>
                                            <p className="text-sm text-gray-400">{location.kelurahan}, {location.city}</p>
                                        </>
                                    ) : (
                                        <p className="text-gray-400">Klik untuk deteksi lokasi</p>
                                    )}
                                </div>
                                <button onClick={getLocation} className="p-3 rounded-xl bg-blue-500/20 text-blue-400"><Navigation className="w-5 h-5" /></button>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4">Jenis Layanan</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setOrderType('kiloan')} className={`p-4 rounded-xl border-2 transition ${orderType === 'kiloan' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10'}`}>
                                    <div className="text-3xl mb-2">🧺</div>
                                    <p className="font-bold text-white">Kiloan</p>
                                    <p className="text-xs text-gray-400">Per Kg, lebih hemat</p>
                                </button>
                                <button onClick={() => setOrderType('satuan')} className={`p-4 rounded-xl border-2 transition ${orderType === 'satuan' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10'}`}>
                                    <div className="text-3xl mb-2">👕</div>
                                    <p className="font-bold text-white">Satuan</p>
                                    <p className="text-xs text-gray-400">Per Item</p>
                                </button>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-yellow-400" />Kecepatan</h3>
                            <div className="space-y-3">
                                <button onClick={() => setServiceSpeed('regular')} className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${serviceSpeed === 'regular' ? 'border-blue-500 bg-blue-500/20' : 'border-white/10'}`}>
                                    <div><p className="font-bold text-white">{settings.regular_label}</p><p className="text-sm text-gray-400">Estimasi {settings.regular_eta}</p></div>
                                    <p className="text-lg font-bold text-blue-400">Rp {settings.regular_price_per_kg.toLocaleString()}/kg</p>
                                </button>
                                {settings.express_enabled && (
                                    <button onClick={() => setServiceSpeed('express')} className={`w-full p-4 rounded-xl border-2 transition flex items-center justify-between ${serviceSpeed === 'express' ? 'border-yellow-500 bg-yellow-500/20' : 'border-white/10'}`}>
                                        <div className="flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" /><div><p className="font-bold text-white">{settings.express_label}</p><p className="text-sm text-gray-400">Estimasi {settings.express_eta}</p></div></div>
                                        <div className="text-right"><p className="text-lg font-bold text-yellow-400">Rp {settings.express_price_per_kg.toLocaleString()}/kg</p></div>
                                    </button>
                                )}
                            </div>
                        </div>

                        <button onClick={() => setStep(2)} disabled={!location} className="btn-gradient w-full py-4 disabled:opacity-50">Lanjut Pilih Item</button>
                    </>
                )}

                {/* Step 2: Item Selection */}
                {step === 2 && (
                    <>
                        {orderType === 'kiloan' && (
                            <div className="glass p-6">
                                <h3 className="font-bold text-white mb-4">Berat & Detail Item</h3>
                                <div className="mb-4">
                                    <label className="text-sm text-gray-400 mb-2 block">Perkiraan Berat (kg)</label>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setWeight(Math.max(1, weight - 1))} className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                            <Minus className="w-6 h-6 text-white" />
                                        </button>
                                        <span className="text-3xl font-bold text-white flex-1 text-center">{weight} kg</span>
                                        <button onClick={() => setWeight(weight + 1)} className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center hover:bg-white/20 transition">
                                            <Plus className="w-6 h-6 text-white" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-400 mb-3">Detail item (opsional, untuk tracking):</p>
                                <div className="space-y-2">
                                    {KILOAN_ITEMS.map(item => (
                                        <div key={item.key} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                                            <span className="text-sm flex items-center gap-2"><span className="text-lg">{item.icon}</span> {item.label}</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setKiloanItems({ ...kiloanItems, [item.key]: Math.max(0, (kiloanItems[item.key] || 0) - 1) })}
                                                    className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                                                >
                                                    <Minus className="w-4 h-4 text-white" />
                                                </button>
                                                <span className="w-8 text-center font-medium">{kiloanItems[item.key] || 0}</span>
                                                <button
                                                    onClick={() => setKiloanItems({ ...kiloanItems, [item.key]: (kiloanItems[item.key] || 0) + 1 })}
                                                    className="w-8 h-8 rounded-lg bg-blue-500/30 flex items-center justify-center hover:bg-blue-500/50 transition"
                                                >
                                                    <Plus className="w-4 h-4 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {orderType === 'satuan' && (
                            <div className="glass p-6">
                                <h3 className="font-bold text-white mb-4">Pilih Item</h3>
                                <div className="space-y-3">
                                    {services.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">{s.icon}</span>
                                                <div>
                                                    <p className="text-white font-medium">{s.name}</p>
                                                    <p className="text-sm text-blue-400">Rp {(serviceSpeed === 'express' ? s.price * 2 : s.price).toLocaleString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setSatuanItems({ ...satuanItems, [s.id]: Math.max(0, (satuanItems[s.id] || 0) - 1) })}
                                                    className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                                                >
                                                    <Minus className="w-5 h-5 text-white" />
                                                </button>
                                                <span className="w-8 text-center font-bold text-lg">{satuanItems[s.id] || 0}</span>
                                                <button
                                                    onClick={() => setSatuanItems({ ...satuanItems, [s.id]: (satuanItems[s.id] || 0) + 1 })}
                                                    className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center hover:bg-blue-500/50 transition"
                                                >
                                                    <Plus className="w-5 h-5 text-white" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Summary Preview */}
                        <div className="glass p-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Estimasi Total</span>
                                <span className="text-xl font-bold text-green-400">Rp {calculateTotal().toLocaleString()}</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button onClick={() => setStep(1)} className="glass px-6 py-4 rounded-xl">Kembali</button>
                            <button onClick={() => setStep(3)} className="btn-gradient flex-1 py-4">Lanjut Data Diri</button>
                        </div>
                    </>
                )}

                {/* Step 3: Contact Info & Confirmation */}
                {step === 3 && (
                    <>
                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-400" />Data Pemesan</h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Nama Lengkap *</label>
                                    <input className="input-glass w-full" placeholder="Nama Anda" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Nomor WhatsApp *</label>
                                    <div className="relative">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                        <input className="input-glass w-full pl-12" placeholder="08xxxxxxxxxx" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-400 mb-2 block">Alamat Lengkap (untuk penjemputan)</label>
                                    <textarea
                                        className="input-glass w-full"
                                        rows={2}
                                        placeholder={location?.address || "Alamat lengkap..."}
                                        value={fullAddress}
                                        onChange={(e) => setFullAddress(e.target.value)}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Kosongkan jika sama dengan lokasi terdeteksi</p>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <h3 className="font-bold text-white mb-4">Ringkasan Pesanan</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-400">Lokasi</span><span className="text-white text-right max-w-[60%]">{location?.address}</span></div>
                                <div className="border-t border-white/10 pt-3" />
                                <div className="flex justify-between"><span className="text-gray-400">Jenis</span><span className="text-white capitalize">{orderType}</span></div>
                                <div className="flex justify-between"><span className="text-gray-400">Kecepatan</span><span className={serviceSpeed === 'express' ? 'text-yellow-400' : 'text-blue-400'}>{serviceSpeed === 'express' ? settings.express_label : settings.regular_label}</span></div>
                                {orderType === 'kiloan' && <div className="flex justify-between"><span className="text-gray-400">Berat</span><span className="text-white">{weight} kg</span></div>}
                                {getTotalItems() > 0 && <div className="flex justify-between"><span className="text-gray-400">Total Item</span><span className="text-white">{getTotalItems()} pcs</span></div>}
                                <div className="border-t border-white/10 pt-3" />
                                <div className="flex justify-between text-lg"><span className="font-bold text-white">Total</span><span className="font-bold text-green-400">Rp {calculateTotal().toLocaleString()}</span></div>
                            </div>
                        </div>

                        <div className="glass p-6">
                            <label className="text-sm text-gray-400 mb-2 block">Catatan (opsional)</label>
                            <textarea className="input-glass w-full" rows={2} placeholder="Catatan untuk kurir..." value={notes} onChange={(e) => setNotes(e.target.value)} />
                        </div>

                        {error && (
                            <div className="bg-red-500/20 border border-red-500/30 text-red-300 p-4 rounded-xl flex items-center gap-3">
                                <AlertCircle className="w-5 h-5" />{error}
                            </div>
                        )}

                        <div className="flex gap-4">
                            <button onClick={() => setStep(2)} className="glass px-6 py-4 rounded-xl">Kembali</button>
                            <button onClick={handleSubmit} disabled={submitting || !customerName || !whatsapp} className="btn-gradient flex-1 py-4 flex items-center justify-center gap-2 disabled:opacity-50">
                                {submitting ? <><Loader2 className="w-5 h-5 animate-spin" />Memproses...</> : <><Package className="w-5 h-5" />Order Sekarang</>}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </main>
    )
}
