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
  // Use the country ISO code if there's a direct match,
  //otherwise base on the two letter facility code prefix
  const countryCode =
    getCountryIsoCode(countryName) || entityObjects.length
      ? entityObjects[0].code.substring(0, 2)
      : null;

  if (!countryCode) throw new ImportValidationError(`${countryName} is not a recognised country`);
  return countryCode;
};
