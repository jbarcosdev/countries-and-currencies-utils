# countries-and-currencies-utils

Small, zero-dependency utilities to work with countries, currencies, languages and timezones. Go from a country code, a currency code or a timezone to the data your app actually needs: names, native names, symbols, languages and offsets.

[![npm version](https://img.shields.io/npm/v/countries-and-currencies-utils.svg)](https://www.npmjs.com/package/countries-and-currencies-utils)
[![npm downloads](https://img.shields.io/npm/dw/countries-and-currencies-utils.svg)](https://www.npmjs.com/package/countries-and-currencies-utils)

## Features

- Country data (name, local name, main language and currency) from an ISO 3166-1 alpha-2 code
- Localized country names in any language, powered by `Intl.DisplayNames`
- Currency data (ISO code, label, symbol, native name) from a country code or a currency code, all synchronous
- Language data (English name and native name) from an ISO 639-1 code
- Country code lookup from an IANA timezone
- Current UTC offset (in minutes) for any IANA timezone
- Zero runtime dependencies and a tiny bundle: the dataset is generated at build time from GeoNames and the rest comes from the platform's `Intl`
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
    getCurrencyDataFromCurrencyCode,
    getLanguageFromLanguageCode,
    getCountryISOCodeFromTimezone,
    getTimezoneOffset
} from 'countries-and-currencies-utils'

const country = getCountryDataFromCountryCode('US')
const countryName = getCountryNameFromCountryCode('US', 'fr')
const currency = getCurrencyDataFromCountryCode('US')
const usd = getCurrencyDataFromCurrencyCode('USD')
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

### `getCurrencyDataFromCurrencyCode(currencyCode)`

Returns detailed currency data from an ISO 4217 currency code, including its symbol. The code is case insensitive.

```ts
const eur = getCurrencyDataFromCurrencyCode('EUR')
```

Returns `{ isoCode: string; label: string; symbol: string; nativeName: string } | undefined`. Returns `undefined` for unknown codes.

`getCurrencyDataFromCurrencyCodeAsync` is still exported as a deprecated wrapper that returns the same data inside a `Promise`, so existing code keeps working.

### `getCurrencyNativeName(currencyCode)`

Returns the name of a currency in the main language of the most populated country that uses it.

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

## Data

The package has no runtime dependencies. Its dataset is generated at build time into `src/data` from two files published by [GeoNames](https://www.geonames.org/):

- `countryInfo.txt`: country names, currencies and languages
- `timeZones.txt`: IANA timezones and the country each one belongs to

Country, language and currency names in other languages, and currency symbols, are resolved at runtime with `Intl`. This means the exact strings can vary slightly between Node.js versions, since they depend on the ICU data of the runtime. Both canonical timezone names (`Asia/Kolkata`) and the legacy names some runtimes still report (`Asia/Calcutta`) are supported.

GeoNames data is licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). This package includes data from GeoNames.

## Updating the data

The raw GeoNames files are committed in `data-sources/`, and every build regenerates the dataset from them, so builds never need network access.

```bash
yarn data:fetch
yarn data:build
yarn data:update
```

`data:fetch` downloads the latest files into `data-sources/`, `data:build` regenerates `src/data/countries-db.ts`, `src/data/currencies-db.ts` and `src/data/timezones-db.ts`, and `data:update` runs both. Review the git diff before releasing. The generated files should not be edited by hand.

## Contributing

Issues and pull requests are welcome at [github.com/jbarcosdev/countries-and-currencies-utils](https://github.com/jbarcosdev/countries-and-currencies-utils).

1. Fork the repository
2. Create your branch: `git checkout -b feature/my-feature`
3. Commit your changes and open a pull request

To refresh the dataset, run `yarn data:update` and include the resulting diff.

## License

Apache-2.0
