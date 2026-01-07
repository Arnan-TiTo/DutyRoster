import { useLanguage } from './LanguageContext'
import { th } from './translations/th'
import { en } from './translations/en'

const translations = { th, en }

export function useTranslation() {
    const { language } = useLanguage()
    return translations[language]
}
