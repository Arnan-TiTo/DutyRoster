'use client'

import { Menu, LogOut } from 'lucide-react'
import Image from 'next/image'

interface TopbarProps {
    displayName: string
    onMenuClick: () => void
    onLogout: () => void
}

export default function Topbar({ displayName, onMenuClick, onLogout }: TopbarProps) {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/90 backdrop-blur-sm border-b border-white/10 px-4 py-3">
            <div className="flex items-center justify-between mx-auto">
                {/* Left: Hamburger + App Name */}
                <div className="flex items-center gap-3">
                    <button
                        onClick={onMenuClick}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                    >
                        <Menu size={20} />
                    </button>
                    <div className="flex items-center gap-2">
                        <Image src="/logo.png" alt="BMW" width={24} height={24} className="object-contain" />
                        <span className="font-semibold text-sm">Duty Roster</span>
                    </div>
                </div>

                {/* Right: User + Logout */}
                <div className="flex items-center gap-2">
                    <span className="text-sm text-white/70 truncate max-w-[120px] sm:max-w-none">{displayName}</span>
                    <button
                        onClick={onLogout}
                        className="p-2 rounded-lg hover:bg-white/10 transition"
                        title="Logout"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
