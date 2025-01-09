import { countries } from "countries-list"

export const countryList = [
  ["DK", "Denmark"],
  ["SE", "Sweden"],
  ["DE", "Germany"],
  ["NO", "Norway"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
].concat(
  Object.entries(countries)
    .map(([countryCode, countryInfo]) => [countryCode, countryInfo.name])
    .sort((a, b) => (a[1] > b[1] ? 1 : a[1] < b[1] ? -1 : 0)),
)
