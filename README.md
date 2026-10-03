# countries-and-currencies-utils

Small, dependency-light utilities to work with countries, currencies, languages and timezones. Go from a country code, a currency code or a timezone to the data your app actually needs: names, native names, symbols, languages and offsets.

[![npm version](https://img.shields.io/npm/v/countries-and-currencies-utils.svg)](https://www.npmjs.com/package/countries-and-currencies-utils)
[![npm downloads](https://img.shields.io/npm/dw/countries-and-currencies-utils.svg)](https://www.npmjs.com/package/countries-and-currencies-utils)

## Features

- Country data (name, local name, main language and currency) from an ISO 3166-1 alpha-2 code
- Localized country names in any language, powered by `Intl.DisplayNames`
- Currency data (ISO code, label, symbol, native name) from a country code or a currency code
- Language data (English name and native name) from an ISO 639-1 code
- Country code lookup from an IANA timezone
- Current UTC offset (in minutes) for any IANA timezone
- Written in TypeScript, fully typed
- Safe by design: every function returns `undefined` (or `0` for offsets) instead of throwing on invalid input

## Installation

```bash
npm install countries-and-currencies-utils
```

```bash
yarn add countries-and-currencies-utils
```

```bash
pnpm add countries-and-currencies-utils
```

## Quick start

```ts
import {
    getCountryDataFromCountryCode,
    getCountryNameFromCountryCode,
    getCurrencyDataFromCountryCode,
    getCurrencyDataFromCurrencyCodeAsync,
    getLanguageFromLanguageCode,
    getCountryISOCodeFromTimezone,
    getTimezoneOffset
} from 'countries-and-currencies-utils'

const country = getCountryDataFromCountryCode('US')
const countryName = getCountryNameFromCountryCode('US', 'fr')
const currency = getCurrencyDataFromCountryCode('US')
const usd = await getCurrencyDataFromCurrencyCodeAsync('USD')
const language = getLanguageFromLanguageCode('en')
const countryCode = getCountryISOCodeFromTimezone('America/New_York')
const offset = getTimezoneOffset('America/New_York')
```

## API

### `getCountryDataFromCountryCode(countryCode?)`

Returns the country data for an ISO 3166-1 alpha-2 code. The code is case insensitive.

```ts
getCountryDataFromCountryCode('us')
```

Returns `CountryData | undefined`:

```ts
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
```

Returns `undefined` when the code is empty or unknown.

### `getCountryNameFromCountryCode(countryCode, lang = 'en')`

Returns the localized name of a country using the platform's `Intl.DisplayNames`.

```ts
getCountryNameFromCountryCode('JP')
getCountryNameFromCountryCode('JP', 'es')
getCountryNameFromCountryCode('JP', 'fr')
```

Returns `string | undefined`. The code must be a 2 letter string, otherwise `undefined` is returned.

### `getCountryISOCodeFromTimezone(timezone)`

Returns the ISO code of the country that a given IANA timezone belongs to. If the timezone is shared by several countries, the first one is returned.

```ts
getCountryISOCodeFromTimezone('Europe/Paris')
```

Returns `string | undefined`.

### `getTimezoneOffset(timezone)`

Returns the current offset of an IANA timezone relative to UTC, in minutes. It takes daylight saving time into account.

```ts
getTimezoneOffset('America/New_York')
getTimezoneOffset('America/Los_Angeles')
getTimezoneOffset('Europe/London')
```

Returns `number`. Returns `0` when the timezone is empty or invalid.

### `getCurrencyDataFromCountryCode(countryCode)`

Returns the currency used by a country.

```ts
getCurrencyDataFromCountryCode('GB')
```

Returns `{ isoCode: string; label: string; nativeName: string } | undefined`.

### `getCurrencyDataFromCurrencyCodeAsync(currencyCode)`

Returns detailed currency data from an ISO 4217 currency code, including its symbol. This function is asynchronous.

```ts
const eur = await getCurrencyDataFromCurrencyCodeAsync('EUR')
```

Returns `Promise<{ isoCode: string; label: string; symbol: string; nativeName: string } | undefined>`.

### `getCurrencyNativeName(currencyCode)`

Returns the native name of a currency, for example how the currency is called in the countries that use it.

```ts
getCurrencyNativeName('JPY')
```

Returns `string | undefined`.

### `getLanguageFromLanguageCode(isoCode)`

Returns the English name and the native name of a language from its ISO 639-1 code.

```ts
getLanguageFromLanguageCode('fr')
getLanguageFromLanguageCode('de')
```

Returns `{ isoCode: string; name: string; nativeName: string } | undefined`. Returns `undefined` for empty or unrecognized codes.

## Common recipes

Detect the user's country and currency from the browser:

```ts
import { getCountryISOCodeFromTimezone, getCurrencyDataFromCountryCode } from 'countries-and-currencies-utils'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
const countryCode = getCountryISOCodeFromTimezone(timezone)
const currency = countryCode ? getCurrencyDataFromCountryCode(countryCode) : undefined
```

Build a localized country selector:

```ts
import { getCountryNameFromCountryCode } from 'countries-and-currencies-utils'

const codes = ['US', 'CA', 'GB', 'DE', 'JP']
const options = codes.map(code => ({ value: code, label: getCountryNameFromCountryCode(code, 'fr') }))
```

## Dependencies

- [`countries-and-timezones`](https://www.npmjs.com/package/countries-and-timezones) for timezone to country lookups
- [`country-currency-utils`](https://www.npmjs.com/package/country-currency-utils) for currency details and symbols

Country, language and name lookups based on `Intl.DisplayNames` depend on the ICU data of the runtime (Node.js 14+ and all modern browsers).

## Contributing

Issues and pull requests are welcome at [github.com/jbarcosdev/countries-and-currencies-utils](https://github.com/jbarcosdev/countries-and-currencies-utils).

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes and open a pull request

## License

Apache-2.0
