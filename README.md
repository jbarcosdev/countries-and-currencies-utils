# countries-and-currencies-utils

> **This package is deprecated and no longer maintained.** It has been replaced by [`iso-data`](https://www.npmjs.com/package/iso-data), which has the same zero-dependency approach, a cleaner API and more features. No new versions of this package will be published.

[![npm version](https://img.shields.io/npm/v/countries-and-currencies-utils.svg)](https://www.npmjs.com/package/countries-and-currencies-utils)
[![successor](https://img.shields.io/npm/v/iso-data.svg?label=iso-data)](https://www.npmjs.com/package/iso-data)

## Migrating to iso-data

```bash
npm install iso-data
```

```ts
import { getCountry, getCurrency, getLanguage, getTimezone } from 'iso-data'

const country = getCountry('US')
const currency = getCurrency('EUR')
const language = getLanguage('fr')
const timezone = getTimezone('America/New_York')
```

`iso-data` adds localized names through a `locale` option, timezone offsets for any date, and the list of timezones of each country. The old functions map to the new ones like this:

| countries-and-currencies-utils | iso-data |
| --- | --- |
| `getCountryDataFromCountryCode(code)` | `getCountry(code)` |
| `getCurrencyDataFromCountryCode(code)` | `getCountry(code)?.currency` |
| `getCurrencyDataFromCurrencyCode(code)` | `getCurrency(code)` |
| `getCurrencyDataFromCurrencyCodeAsync(code)` | `getCurrency(code)` |
| `getCurrencyNativeName(code)` | `getCurrency(code)?.nativeName` |
| `getLanguageFromLanguageCode(code)` | `getLanguage(code)` |
| `getCountryISOCodeFromTimezone(timezone)` | `getTimezone(timezone)?.countryCode` |
| `getTimezoneOffset(timezone)` | `getTimezone(timezone)?.offset` |
| `getCountryNameFromCountryCode(code, lang)` | `getCountry(code, { locale: lang })?.name` |

Things to keep in mind when migrating:

- The new functions use consistent field names. `localName` and `label` become `nativeName` and `name`.
- `getTimezone` returns `undefined` for an invalid timezone, while `getTimezoneOffset` returned `0`, which was indistinguishable from UTC.
- `getCurrency` is synchronous, so the `await` is no longer needed.
- `getCountry` only knows the countries in its dataset, while `getCountryNameFromCountryCode` accepted any ISO 3166-1 region.

The rest of this document describes this package for people who still depend on it.

## Installation

```bash
npm install countries-and-currencies-utils
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
getCurrencyDataFromCurrencyCode('EUR')
```

Returns `{ isoCode: string; label: string; symbol: string; nativeName: string } | undefined`. Returns `undefined` for unknown codes.

`getCurrencyDataFromCurrencyCodeAsync` is still exported as a deprecated wrapper that returns the same data inside a `Promise`.

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
```

Returns `{ isoCode: string; name: string; nativeName: string } | undefined`. Returns `undefined` for empty or unrecognized codes.

## Data

The package has no runtime dependencies. Its dataset was generated at build time from two files published by [GeoNames](https://www.geonames.org/):

- `countryInfo.txt`: country names, currencies and languages
- `timeZones.txt`: IANA timezones and the country each one belongs to

Country, language and currency names in other languages, and currency symbols, are resolved at runtime with `Intl`, so the exact strings can vary slightly between Node.js versions.

GeoNames data is licensed under [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). This package includes data from GeoNames.

## License

Apache-2.0
