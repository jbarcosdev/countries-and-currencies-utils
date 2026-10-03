import { countries, CountryCode } from '../data'
import { getCurrencyName, getRegionName } from './intl-names'
import { getLanguageFromLanguageCode } from './get-language-from-language-code'

export interface CountryData {
    name: string
    localName: string
    language: {
        isoCode: string
        name: string
        localName: string
    }
    currency: {
        isoCode: string
        name: string
        localName: string
    }
}

interface CountryEntry {
    name: string
    language: string
    currency: string
}

export function getCountryDataFromCountryCode (countryCode?: CountryCode | (string & {})): CountryData | undefined {
    if (!countryCode) return undefined

    const code = countryCode.toUpperCase()
    const entry = (countries as Record<string, CountryEntry>)[code]
    if (!entry) return undefined

    const language = getLanguageFromLanguageCode(entry.language)
    const currencyName = getCurrencyName(entry.currency, 'en') ?? entry.currency

    return {
        name: entry.name,
        localName: entry.language === 'en' ? entry.name : getRegionName(code, entry.language) ?? entry.name,
        language: {
            isoCode: entry.language,
            name: language?.name ?? entry.language,
            localName: language?.nativeName ?? entry.language
        },
        currency: {
            isoCode: entry.currency,
            name: currencyName,
            localName: entry.language === 'en' ? currencyName : getCurrencyName(entry.currency, entry.language) ?? currencyName
        }
    }
}
