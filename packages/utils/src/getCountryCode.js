/**
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */
import { ImportValidationError } from './errors';

export const getCountryCode = (countryName, entityObjects = []) => {
  if (countryName === 'Demo Land') {
    return 'DL';
  }

  const { getCode: getCountryIsoCode } = require('countrynames');
  const countryCode = getCountryIsoCode(countryName);
  if (!countryCode) throw new ImportValidationError(`${countryName} is not a recognised country`);
  return countryCode;
};
