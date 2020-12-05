/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { getName } from 'country-list';

const circleFlagsUrl = 'https://hatscripts.github.io/circle-flags/flags';
// eg. https://hatscripts.github.io/circle-flags/flags/as.svg
export const countryFlagImage = orgUnit => `${circleFlagsUrl}/${orgUnit.toLowerCase()}.svg`;

export const getCountryName = orgUnit => (orgUnit ? getName(orgUnit.toLowerCase()) : null);
