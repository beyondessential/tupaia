/**
 * Tupaia MediTrak
 * Copyright (c) 2018 Beyond Essential Systems Pty Ltd
 */

import { getIsProductionEnvironment } from '@tupaia/utils';

const API_VERSION = 2;
const DOMAIN = 'tupaia.org';

export const getApiUrl = (endpoint, queryParameters) => {
  const subdomain = getIsProductionEnvironment() ? 'api' : 'dev-api';
  const queryString = Object.entries(queryParameters).reduce(
    (stringSoFar, [key, value]) =>
      value === undefined
        ? stringSoFar
        : `${stringSoFar ? `${stringSoFar}&` : '?'}${encodeURIComponent(key)}=${encodeURIComponent(
            value,
          )}`,
    null,
  );
  return `https://${subdomain}.${DOMAIN}/v${API_VERSION}/${endpoint}${queryString}`;
};
