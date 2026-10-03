import { getCountryDataFromCountryCode } from './get-country-data-from-country-code'
import { getCurrencyName, getCurrencySymbol } from './intl-names'
import { CountryCode, CurrencyCode, currencies } from '../data'

export function getCurrencyDataFromCountryCode (countryCode: CountryCode | (string & {})): { isoCode: string; label: string; nativeName: string } | undefined {
    try {
        const countryData = getCountryDataFromCountryCode(countryCode)
        if (!countryData) return undefined

        const currencyData = countryData.currency
        return {
            isoCode: currencyData.isoCode,
            label: currencyData.name,
            nativeName: currencyData.localName,
        }
    } catch (error) {
        return undefined
    }
}

export function getCurrencyDataFromCurrencyCode (currencyCode: CurrencyCode | (string & {})): { isoCode: string; label: string; symbol: string; nativeName: string } | undefined {
    if (!currencyCode || typeof currencyCode !== 'string') return undefined

    const code = currencyCode.toUpperCase()
    const label = getCurrencyName(code, 'en')
    if (!label) return undefined

    return {
        isoCode: code,
        label,
        symbol: getCurrencySymbol(code) ?? code,
        nativeName: getCurrencyNativeName(code) ?? label
    }
}

/** @deprecated Use getCurrencyDataFromCurrencyCode, which is synchronous */
export async function getCurrencyDataFromCurrencyCodeAsync (currencyCode: CurrencyCode | (string & {})): Promise<{ isoCode: string; label: string; symbol: string; nativeName: string } | undefined> {
    return getCurrencyDataFromCurrencyCode(currencyCode)
}

export function getCurrencyNativeName (currencyCode: CurrencyCode | (string & {})): string | undefined {
    if (!currencyCode || typeof currencyCode !== 'string') return undefined

    const code = currencyCode.toUpperCase()
    const language = (currencies as Record<string, { language: string }>)[code]?.language
    if (!language) return undefined

    return getCurrencyName(code, language)
}
