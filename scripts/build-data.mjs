import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const sources = join(root, 'data-sources')
const output = join(root, 'src', 'data')
const obsoleteCountries = new Set(['AN', 'CS'])

const readRows = async file => (await readFile(join(sources, file), 'utf8')).split(/\r?\n/).filter(line => line.trim() !== '').map(line => line.split('\t'))

const languageNames = new Intl.DisplayNames(['en'], { type: 'language', fallback: 'none' })

const isKnownLanguage = code => {
    try {
        return languageNames.of(code) !== undefined
    } catch {
        return false
    }
}

const pickLanguage = languages => {
    const codes = languages.split(',').map(item => item.split('-')[0].trim().toLowerCase()).filter(Boolean)
    return codes.find(isKnownLanguage) ?? codes[0] ?? 'en'
}

const inline = value => `{ ${Object.entries(value).map(([key, item]) => `${JSON.stringify(key)}: ${JSON.stringify(item)}`).join(', ')} }`

const render = (typeName, constName, object, format) => {
    const body = Object.keys(object).sort().map(key => `    ${JSON.stringify(key)}: ${format(object[key])}`).join(',\n')
    const typeLine = typeName ? `export type ${typeName} = keyof typeof ${constName}\n` : ''
    return `${typeLine}export const ${constName} = {\n${body}\n}\n`
}

const countryRows = (await readRows('countryInfo.txt')).filter(row => !row[0].startsWith('#') && /^[A-Z]{2}$/.test(row[0]) && row.length >= 16 && !obsoleteCountries.has(row[0]))
const timezoneRows = (await readRows('timeZones.txt')).filter(row => /^[A-Z]{2}$/.test(row[0]) && row[1] && !obsoleteCountries.has(row[0]))

const countries = {}
const currencies = {}
const currencyPopulation = {}

for (const row of countryRows) {
    const code = row[0]
    const name = row[4].trim()
    const currency = row[10].trim().toUpperCase()
    if (!name || !/^[A-Z]{3}$/.test(currency)) continue

    const language = pickLanguage(row[15])
    const population = Number(row[7]) || 0

    countries[code] = { name, language, currency }

    if (!(currency in currencyPopulation) || population > currencyPopulation[currency]) {
        currencyPopulation[currency] = population
        currencies[currency] = { language }
    }
}

const timezones = {}

for (const row of timezoneRows) {
    const zone = row[1].trim()
    timezones[zone] ??= []
    if (!timezones[zone].includes(row[0])) timezones[zone].push(row[0])
}

const canonicalZone = zone => {
    try {
        return new Intl.DateTimeFormat('en-US', { timeZone: zone }).resolvedOptions().timeZone
    } catch {
        return zone
    }
}

for (const zone of Object.keys(timezones)) {
    const alias = canonicalZone(zone)
    if (alias !== zone && !timezones[alias]) timezones[alias] = timezones[zone]
}

if (Object.keys(countries).length < 200) throw new Error(`Only ${Object.keys(countries).length} countries parsed, check data-sources/countryInfo.txt`)
if (Object.keys(timezones).length < 300) throw new Error(`Only ${Object.keys(timezones).length} timezones parsed, check data-sources/timeZones.txt`)

await writeFile(join(output, 'countries-db.ts'), render('CountryCode', 'countries', countries, inline))
await writeFile(join(output, 'currencies-db.ts'), render('CurrencyCode', 'currencies', currencies, inline))
await writeFile(join(output, 'timezones-db.ts'), render(null, 'timezones', timezones, value => JSON.stringify(value)))

console.log(`Generated ${Object.keys(countries).length} countries, ${Object.keys(currencies).length} currencies, ${Object.keys(timezones).length} timezones`)
