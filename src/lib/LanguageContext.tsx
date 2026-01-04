'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Language = 'th' | 'en'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('th')
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        // Load language from localStorage on mount
        const saved = localStorage.getItem('language') as Language
        if (saved === 'th' || saved === 'en') {
            setLanguageState(saved)
        }
        setMounted(true)
    }, [])

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
        localStorage.setItem('language', lang)
    }

    // Prevent hydration mismatch by not rendering until mounted
    if (!mounted) {
        return <>{children}</>
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)

    // Return default Thai language if not within provider (e.g., login page)
    if (!context) {
        return {
            language: 'th' as const,
            setLanguage: () => { } // no-op when outside provider
        }
    }

    return context
}
