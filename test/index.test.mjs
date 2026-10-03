import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { getCountryDataFromCountryCode, getCountryISOCodeFromTimezone, getCountryNameFromCountryCode, getCurrencyDataFromCountryCode, getCurrencyDataFromCurrencyCode, getCurrencyDataFromCurrencyCodeAsync, getCurrencyNativeName, getLanguageFromLanguageCode, getTimezoneOffset } from '../dist/index.mjs'

const dataDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'src', 'data')
const readKeys = (file, pattern) => [...readFileSync(join(dataDir, file), 'utf8').matchAll(pattern)].map(match => match[1])
const countryCodes = readKeys('countries-db.ts', /^ {4}"([A-Z]{2})":/gm)
const currencyCodes = readKeys('currencies-db.ts', /^ {4}"([A-Z]{3})":/gm)
const timezoneIds = readKeys('timezones-db.ts', /^ {4}"([^"]+)":/gm)

test('dataset has sane size and no obsolete countries', () => {
    assert.ok(countryCodes.length > 200)
    assert.ok(currencyCodes.length > 100)
    assert.ok(timezoneIds.length > 300)
    assert.ok(!countryCodes.includes('AN'))
    assert.ok(!countryCodes.includes('CS'))
})

test('getCountryDataFromCountryCode returns data for known countries', () => {
    const us = getCountryDataFromCountryCode('us')
    assert.equal(us?.name, 'United States')
    assert.equal(us?.language.isoCode, 'en')
    assert.equal(us?.currency.isoCode, 'USD')

    assert.equal(getCountryDataFromCountryCode('DE')?.currency.isoCode, 'EUR')
    assert.equal(getCountryDataFromCountryCode('JP')?.language.isoCode, 'ja')
})

test('getCountryDataFromCountryCode returns undefined for invalid input', () => {
    assert.equal(getCountryDataFromCountryCode(undefined), undefined)
    assert.equal(getCountryDataFromCountryCode(''), undefined)
    assert.equal(getCountryDataFromCountryCode('ZZ'), undefined)
    assert.equal(getCountryDataFromCountryCode('USA'), undefined)
})

test('every country resolves complete data with real names', () => {
    const problems = []

    for (const code of countryCodes) {
        const country = getCountryDataFromCountryCode(code)
        if (!country) {
            problems.push(`${code}: missing country data`)
            continue
        }
        if (!country.name || !country.localName) problems.push(`${code}: empty country name`)
        if (country.language.name === country.language.isoCode) problems.push(`${code}: language name fell back to code (${country.language.isoCode})`)
        if (country.language.localName === country.language.isoCode) problems.push(`${code}: language local name fell back to code (${country.language.isoCode})`)
        if (country.currency.name === country.currency.isoCode) problems.push(`${code}: currency name fell back to code (${country.currency.isoCode})`)
        if (!getCurrencyDataFromCountryCode(code)) problems.push(`${code}: missing currency data`)
    }

    assert.deepEqual(problems, [])
})

test('every currency resolves symbol and names', () => {
    const problems = []

    for (const code of currencyCodes) {
        const currency = getCurrencyDataFromCurrencyCode(code)
        if (!currency) {
            problems.push(`${code}: missing currency data`)
            continue
        }
        if (!currency.symbol) problems.push(`${code}: empty symbol`)
        if (currency.label === code) problems.push(`${code}: label fell back to code`)
        if (!getCurrencyNativeName(code)) problems.push(`${code}: missing native name`)
    }

    assert.deepEqual(problems, [])
})

test('currency lookups are case insensitive and reject invalid codes', () => {
    assert.equal(getCurrencyDataFromCurrencyCode('eur')?.isoCode, 'EUR')
    assert.equal(getCurrencyDataFromCurrencyCode('EUR')?.symbol, '€')
    assert.equal(getCurrencyDataFromCurrencyCode('ZZZ'), undefined)
    assert.equal(getCurrencyDataFromCurrencyCode('US'), undefined)
    assert.equal(getCurrencyDataFromCurrencyCode(''), undefined)
})

test('deprecated async wrapper matches the sync function', async () => {
    assert.deepEqual(await getCurrencyDataFromCurrencyCodeAsync('USD'), getCurrencyDataFromCurrencyCode('USD'))
})

test('getCountryISOCodeFromTimezone resolves canonical zones and aliases', () => {
    assert.equal(getCountryISOCodeFromTimezone('America/New_York'), 'US')
    assert.equal(getCountryISOCodeFromTimezone('Europe/London'), 'GB')
    assert.equal(getCountryISOCodeFromTimezone('Asia/Kolkata'), 'IN')
    assert.equal(getCountryISOCodeFromTimezone('Asia/Calcutta'), 'IN')
    assert.equal(getCountryISOCodeFromTimezone('Europe/Kyiv'), 'UA')
    assert.equal(getCountryISOCodeFromTimezone('Europe/Kiev'), 'UA')
})

test('getCountryISOCodeFromTimezone returns undefined for invalid input', () => {
    assert.equal(getCountryISOCodeFromTimezone(undefined), undefined)
    assert.equal(getCountryISOCodeFromTimezone(''), undefined)
    assert.equal(getCountryISOCodeFromTimezone('Nope/Zone'), undefined)
})

test('every timezone resolves to a country code', () => {
    for (const zone of timezoneIds) {
        assert.match(getCountryISOCodeFromTimezone(zone) ?? '', /^[A-Z]{2}$/, `${zone}: no country`)
    }
})

test('getCountryNameFromCountryCode localizes names', () => {
    assert.equal(getCountryNameFromCountryCode('US'), 'United States')
    assert.equal(getCountryNameFromCountryCode('us', 'en'), 'United States')
    assert.equal(getCountryNameFromCountryCode('', 'en'), undefined)
    assert.equal(getCountryNameFromCountryCode('USA'), undefined)
})

test('getLanguageFromLanguageCode returns English and native names', () => {
    assert.deepEqual(getLanguageFromLanguageCode('fr'), { isoCode: 'fr', name: 'French', nativeName: 'Français' })
    assert.equal(getLanguageFromLanguageCode(''), undefined)
    assert.equal(getLanguageFromLanguageCode(undefined), undefined)
})

test('getTimezoneOffset handles valid and invalid zones', () => {
    assert.equal(getTimezoneOffset('UTC'), 0)
    assert.equal(getTimezoneOffset(undefined), 0)
    assert.equal(getTimezoneOffset('Nope/Zone'), 0)
    assert.ok([-300, -240].includes(getTimezoneOffset('America/New_York')))
})
