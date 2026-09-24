import { CountryCode } from '../data'

export function getCountryNameFromCountryCode(countryCode: CountryCode, lang = 'en') {
    if (!countryCode || typeof countryCode !== 'string' || countryCode.length !== 2) {
        return undefined
    }

    const regionNames = new Intl.DisplayNames([lang], { type: 'region' })

    try {
        return regionNames.of(countryCode.toUpperCase())
    } catch (error) {
        return undefined
    }
}
