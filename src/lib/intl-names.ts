type DisplayType = 'region' | 'currency'

const cache = new Map<string, Intl.DisplayNames | null>()

function getDisplayNames(locale: string, type: DisplayType) {
    const key = `${type}:${locale}`
    if (cache.has(key)) return cache.get(key)!

    let names: Intl.DisplayNames | null = null
    try {
        names = new Intl.DisplayNames([locale], { type, fallback: 'none' })
    } catch {
        names = null
    }

    cache.set(key, names)
    return names
}

function capitalize(value: string) {
    return value.charAt(0).toUpperCase() + value.slice(1)
}

export function getRegionName(regionCode: string, locale: string): string | undefined {
    try {
        const name = getDisplayNames(locale, 'region')?.of(regionCode)
        return name ? capitalize(name) : undefined
    } catch {
        return undefined
    }
}

export function getCurrencyName(currencyCode: string, locale: string): string | undefined {
    try {
        const name = getDisplayNames(locale, 'currency')?.of(currencyCode)
        return name ? capitalize(name) : undefined
    } catch {
        return undefined
    }
}

export function getCurrencySymbol(currencyCode: string): string | undefined {
    try {
        const parts = new Intl.NumberFormat('en', { style: 'currency', currency: currencyCode, currencyDisplay: 'narrowSymbol' }).formatToParts(0)
        return parts.find(part => part.type === 'currency')?.value
    } catch {
        return undefined
    }
}
