'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

type Language = 'th' | 'en'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguageState] = useState<Language>('th')

    const setLanguage = (lang: Language) => {
        setLanguageState(lang)
    }

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)

    // Return default Thai language if not within provider
    if (!context) {
        return {
            language: 'th' as const,
            setLanguage: () => { } // no-op when outside provider
        }
    }

    return context
}
