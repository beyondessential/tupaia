/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getName } from 'country-list';

// eg. https://hatscripts.github.io/circle-flags/flags/as.svg
const circleFlagsUrl = 'https://hatscripts.github.io/circle-flags/flags';

export const countryFlagImage = countryCode => {
  // Temporary fix for Pitcairn until the country code in the database is updated
  // @see https://github.com/beyondessential/tupaia-backlog/issues/1782
  if (countryCode === 'PI') {
    return `${circleFlagsUrl}/pn.svg`;
  }

  return `${circleFlagsUrl}/${countryCode.toLowerCase()}.svg`;
};

export const getCountryName = countryCode => {
  // Temporary fix for Pitcairn until the country code in the database is updated
  // @see https://github.com/beyondessential/tupaia-backlog/issues/1782
  if (countryCode === 'PI') {
    return getName('PN') || '';
  }
  return getName(countryCode) || '';
};
