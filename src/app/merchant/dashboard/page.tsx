'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Plus, Trash2, Edit } from 'lucide-react'

type Service = {
    id: string
    name: string
    description: string
    price_per_unit: number
    unit_type: string
}

export default function MerchantDashboard() {
    const [services, setServices] = useState<Service[]>([])
    const [loading, setLoading] = useState(true)
    const [isAdding, setIsAdding] = useState(false)
    const supabase = createClient()

    const [newService, setNewService] = useState({
        name: '',
        description: '',
        price_per_unit: '',
        unit_type: 'kg'
    })

    useEffect(() => {
        fetchServices()
    }, [])

    const fetchServices = async () => {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data } = await supabase
            .from('services')
            .select('*')
            .eq('merchant_id', user.id)
            .order('created_at', { ascending: false })

        if (data) setServices(data)
        setLoading(false)
    }

    const handleAddService = async (e: React.FormEvent) => {
        e.preventDefault()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { error } = await supabase.from('services').insert({
            merchant_id: user.id,
            name: newService.name,
            description: newService.description,
            price_per_unit: parseFloat(newService.price_per_unit),
            unit_type: newService.unit_type
        })

        if (!error) {
            setNewService({ name: '', description: '', price_per_unit: '', unit_type: 'kg' })
            setIsAdding(false)
            fetchServices()
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm('Hapus layanan ini?')) return
        await supabase.from('services').delete().eq('id', id)
        fetchServices()
    }

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <header className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Merchant Dashboard</h1>
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition"
                    >
                        <Plus size={20} />
                        Tambah Layanan
                    </button>
                </header>

                {isAdding && (
                    <div className="bg-white p-6 rounded-xl shadow-md mb-8 animate-in fade-in slide-in-from-top-4">
                        <h3 className="text-lg font-semibold mb-4">Input Layanan Baru</h3>
                        <form onSubmit={handleAddService} className="grid md:grid-cols-2 gap-4">
                            <input
                                className="border p-2 rounded"
                                placeholder="Nama Layanan (misal: Cuci Kering)"
                                required
                                value={newService.name}
                                onChange={e => setNewService({ ...newService, name: e.target.value })}
                            />
                            <input
                                className="border p-2 rounded"
                                placeholder="Harga (misal: 5000)"
                                type="number"
                                required
                                value={newService.price_per_unit}
                                onChange={e => setNewService({ ...newService, price_per_unit: e.target.value })}
                            />
                            <select
                                className="border p-2 rounded"
                                value={newService.unit_type}
                                onChange={e => setNewService({ ...newService, unit_type: e.target.value })}
                            >
                                <option value="kg">per Kg</option>
                                <option value="pc">per Lembar/Pc</option>
                                <option value="mtr">per Meter</option>
                            </select>
                            <textarea
                                className="border p-2 rounded md:col-span-2"
                                placeholder="Deskripsi singkat (opsional)"
                                value={newService.description}
                                onChange={e => setNewService({ ...newService, description: e.target.value })}
                            />
                            <div className="md:col-span-2 flex justify-end gap-2">
                                <button type="button" onClick={() => setIsAdding(false)} className="text-gray-500 font-medium px-4">Batal</button>
                                <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium">Simpan</button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                    {services.map(service => (
                        <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex justify-between items-start">
                            <div>
                                <h3 className="font-bold text-lg text-gray-800">{service.name}</h3>
                                <p className="text-sm text-gray-500 mb-2">{service.description || 'Tidak ada deskripsi'}</p>
                                <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
                                    Rp {service.price_per_unit.toLocaleString('id-ID')} / {service.unit_type}
                                </span>
                            </div>
                            <button onClick={() => handleDelete(service.id)} className="text-red-400 hover:text-red-600 p-2">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    ))}
                    {services.length === 0 && !loading && (
                        <div className="col-span-full text-center py-10 text-gray-400">
                            Belum ada layanan yang ditambahkan.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
