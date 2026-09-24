import { countries, CountryCode } from '../data'

interface CountryData {
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

export function getCountryDataFromCountryCode (countryCode?: CountryCode | (string & {})): CountryData | undefined {
    if (!countryCode) return undefined

    const country = countries[countryCode.toUpperCase()]
    if (!country) return undefined

    return country
}
