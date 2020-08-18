import { getCode as getCountryIsoCode } from 'countrynames';
import { ImportValidationError } from '@tupaia/utils';

export const getCountryCode = (countryName, entityObjects) => {
  // Use the country ISO code if there's a direct match, otherwise base on the two letter facility
  // code prefix
  const country = getCountryIsoCode(countryName) || entityObjects[0].code.substring(0, 2);
  if (!country) throw new ImportValidationError(`${countryName} is not a recognised country`);
  return country;
};
