import { getEnvVarOrDefault, getIsProductionEnvironment } from '@tupaia/utils';

const API_VERSION = 2;

export const getApiUrl = (endpoint, queryParameters) => {
  const DOMAIN = getEnvVarOrDefault('DOMAIN', 'tupaia.org');
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
