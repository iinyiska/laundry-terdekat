'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, Bell, Moon, Sun, Globe, Volume2, VolumeX, Smartphone, Info, Shield, ChevronRight } from 'lucide-react'

type Settings = {
    darkMode: boolean
    notifications: boolean
    soundEffects: boolean
    language: string
}

export default function SettingsPage() {
    const [settings, setSettings] = useState<Settings>({
        darkMode: true,
        notifications: true,
        soundEffects: true,
        language: 'id'
    })

    useEffect(() => {
        // Load settings from localStorage
        const saved = localStorage.getItem('app_settings')
        if (saved) {
            setSettings(JSON.parse(saved))
        }
    }, [])

    const updateSetting = (key: keyof Settings, value: any) => {
        const newSettings = { ...settings, [key]: value }
        setSettings(newSettings)
        localStorage.setItem('app_settings', JSON.stringify(newSettings))
    }

    return (
        <main className="min-h-screen pb-8">
            <div className="fixed inset-0 -z-10"><div className="absolute inset-0 bg-gradient-to-br from-slate-900 to-slate-800" /></div>

            {/* Header */}
            <header className="glass-bright sticky top-0 z-40 px-4 py-4">
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-xl bg-white/10 hover:bg-white/20 ml-10">
                        <ChevronLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-bold text-lg text-white">Pengaturan</h1>
                </div>
            </header>

            <div className="px-4 max-w-2xl mx-auto py-6 space-y-6">
                {/* Appearance */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Moon className="w-5 h-5 text-purple-400" />
                        Tampilan
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Mode Gelap</p>
                                <p className="text-sm text-gray-400">Tampilan lebih nyaman di malam hari</p>
                            </div>
                            <button
                                onClick={() => updateSetting('darkMode', !settings.darkMode)}
                                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${settings.darkMode ? 'bg-blue-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'
                                    }`}>
                                    {settings.darkMode ? (
                                        <Moon className="w-4 h-4 m-1 text-blue-500" />
                                    ) : (
                                        <Sun className="w-4 h-4 m-1 text-yellow-500" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Notifications */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5 text-yellow-400" />
                        Notifikasi
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Notifikasi Push</p>
                                <p className="text-sm text-gray-400">Terima update status pesanan</p>
                            </div>
                            <button
                                onClick={() => updateSetting('notifications', !settings.notifications)}
                                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${settings.notifications ? 'bg-blue-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform ${settings.notifications ? 'translate-x-6' : 'translate-x-0'
                                    }`} />
                            </button>
                        </div>

                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-white font-medium">Efek Suara</p>
                                <p className="text-sm text-gray-400">Bunyi saat ada notifikasi baru</p>
                            </div>
                            <button
                                onClick={() => updateSetting('soundEffects', !settings.soundEffects)}
                                className={`w-14 h-8 rounded-full transition-colors flex items-center px-1 ${settings.soundEffects ? 'bg-blue-500' : 'bg-gray-600'
                                    }`}
                            >
                                <div className={`w-6 h-6 rounded-full bg-white shadow-md transition-transform flex items-center justify-center ${settings.soundEffects ? 'translate-x-6' : 'translate-x-0'
                                    }`}>
                                    {settings.soundEffects ? (
                                        <Volume2 className="w-3 h-3 text-blue-500" />
                                    ) : (
                                        <VolumeX className="w-3 h-3 text-gray-500" />
                                    )}
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Language */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Globe className="w-5 h-5 text-green-400" />
                        Bahasa
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => updateSetting('language', 'id')}
                            className={`p-4 rounded-xl border transition ${settings.language === 'id'
                                    ? 'border-blue-500 bg-blue-500/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            🇮🇩 Indonesia
                        </button>
                        <button
                            onClick={() => updateSetting('language', 'en')}
                            className={`p-4 rounded-xl border transition ${settings.language === 'en'
                                    ? 'border-blue-500 bg-blue-500/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-400 hover:bg-white/10'
                                }`}
                        >
                            🇬🇧 English
                        </button>
                    </div>
                </div>

                {/* About Links */}
                <div className="glass p-6">
                    <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                        <Info className="w-5 h-5 text-blue-400" />
                        Informasi
                    </h3>
                    <div className="space-y-2">
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
                            <div className="flex items-center gap-3">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <span className="text-white">Kebijakan Privasi</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
                            <div className="flex items-center gap-3">
                                <Info className="w-5 h-5 text-gray-400" />
                                <span className="text-white">Syarat & Ketentuan</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                        <button className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition">
                            <div className="flex items-center gap-3">
                                <Smartphone className="w-5 h-5 text-gray-400" />
                                <span className="text-white">Tentang Aplikasi</span>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </div>

                {/* App Version */}
                <div className="text-center text-gray-500 text-sm">
                    <p>Laundry Terdekat v2.6.0</p>
                    <p className="mt-1">© 2026 All rights reserved</p>
                </div>
            </div>
        </main>
    )
}
