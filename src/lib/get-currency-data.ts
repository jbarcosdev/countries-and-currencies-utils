import { getCurrencyData } from 'country-currency-utils'
import { getCountryDataFromCountryCode } from './get-country-data-from-country-code'
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

export async function getCurrencyDataFromCurrencyCodeAsync (currencyCode: CurrencyCode | (string & {})): Promise<{ isoCode: string; label: string; symbol: string; nativeName: string } | undefined> {
    try {
        const currencyData = await getCurrencyData(currencyCode)
        if (!currencyData) return undefined

        return {
            isoCode: currencyData.currencyCode,
            label: currencyData.name,
            symbol: currencyData.symbolPreferred || currencyData.symbol,
            nativeName: getCurrencyNativeName(currencyCode) || currencyData.name
        }
    } catch (error) {
        return undefined
    }
}

export function getCurrencyNativeName (currencyCode: CurrencyCode | (string & {})): string | undefined {
    return currencies[currencyCode]?.nativeName
}
