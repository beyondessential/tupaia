import { ImportValidationError } from './errors';

// We sometimes use non-official names for countries. The most obvious example is Demo Land, but
// also Laos instead of Laos People's Democratic Republic, etc.
const UNOFFICIAL_NAME_TO_CODE = {
  'demo land': 'DL',

  'congo (the)': 'CG',
  laos: 'LA',
  "côte d'ivoire": 'CI',
  'federated states of micronesia': 'FM',
  'pitcairn islands': 'PI',
};

export const getCountryCode = countryName => {
  // CommonJS import because countrynames internally uses `__dirname` (instead of `import.meta.dirname`)
  // @see https://nodejs.org/api/esm.html#differences-between-es-modules-and-commonjs
  const { getCode: getCountryIsoCode } = require('countrynames');
  const countryCode =
    UNOFFICIAL_NAME_TO_CODE[countryName.toLowerCase()] ?? getCountryIsoCode(countryName);
  if (!countryCode) throw new ImportValidationError(`${countryName} is not a recognised country`);
  return countryCode;
};
