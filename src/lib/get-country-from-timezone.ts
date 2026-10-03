import { timezones } from '../data'

function getCountryCodesFromTimezone(timezone: string): string[] | undefined {
    const zones = timezones as Record<string, string[]>
    if (zones[timezone]) return zones[timezone]

    try {
        const canonical = new Intl.DateTimeFormat('en-US', { timeZone: timezone }).resolvedOptions().timeZone
        return zones[canonical]
    } catch {
        return undefined
    }
}

export function getCountryISOCodeFromTimezone (timezone: string | undefined): string | undefined {
    if (!timezone) return undefined

    return getCountryCodesFromTimezone(timezone)?.[0]
}
