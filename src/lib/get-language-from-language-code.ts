export function getLanguageFromLanguageCode (isoCode?: string): { isoCode: string; name: string; nativeName: string } | undefined {
    if (!isoCode || typeof isoCode !== 'string' || isoCode.trim() === '') {
        return undefined
    }

    const code = isoCode.trim().toLowerCase()

    try {
        const nameFetcher = new Intl.DisplayNames(['en'], { type: 'language' })
        const nativeFetcher = new Intl.DisplayNames([code], { type: 'language' })

        const name = nameFetcher.of(code)
        const nativeName = nativeFetcher.of(code)

        if (!name || !nativeName || name === code) return undefined

        return { isoCode: code, name, nativeName }
    } catch {
        return undefined
    }
}
