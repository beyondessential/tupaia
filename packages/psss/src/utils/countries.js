/*
 * Tupaia
 * Copyright (c) 2017 - 2020 Beyond Essential Systems Pty Ltd
 */

import { circleFlagsUrl } from '../constants';

export const countryFlagImage = countryCode => `${circleFlagsUrl}/${countryCode}.svg`;

export const getCountryName = countryCode => `Country Name - ${countryCode}`;
