'use client'

import { useLanguage } from '@/lib/LanguageContext'
import { Globe } from 'lucide-react'

export default function LanguageSwitch() {
    const { language, setLanguage } = useLanguage()

    const toggleLanguage = () => {
        setLanguage(language === 'th' ? 'en' : 'th')
    }

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-xl2 border border-white/10 hover:bg-white/5 transition text-sm"
            title={language === 'th' ? 'Switch to English' : 'เปลี่ยนเป็นภาษาไทย'}
        >
            <Globe size={16} />
            <span className="font-medium">{language === 'th' ? 'ไทย' : 'EN'}</span>
        </button>
    )
}
