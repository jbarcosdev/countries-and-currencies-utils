export function getTimezoneOffset (timezone: string): number {
    if (!timezone) return 0

    try {
        const now = new Date()
        const tzString = now.toLocaleString('en-US', { timeZone: timezone })
        const tzDate = new Date(tzString)
        const utcDate = new Date(now.toLocaleString('en-US', { timeZone: 'UTC' }))

        return Math.round((tzDate.getTime() - utcDate.getTime()) / 60000)
    } catch {
        return 0
    }
}
